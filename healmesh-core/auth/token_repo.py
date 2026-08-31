"""
healmesh-core/auth/token_repo.py

Token Repository for HealMesh API Tokens.
Supports token generation, SHA-256 hashing, storage, lookup, revocation,
and append-only audit event logging.
"""
from __future__ import annotations

import hashlib
import json
import logging
import os
import secrets
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID, uuid4

from schema.models import APITokenCapability, APITokenRecord

logger = logging.getLogger(__name__)


def hash_token(raw_token: str) -> str:
    """Generate SHA-256 hex digest of a raw token."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def generate_raw_token() -> str:
    """Generate a high-entropy raw API bearer token with hm_live_ prefix."""
    return f"hm_live_{secrets.token_hex(32)}"


class TokenRepository:
    """
    Manages API tokens in PostgreSQL, with a process-shared in-memory fallback
    for isolated testing environments.
    """

    # Process-shared in-memory storage for test/local environments without PostgreSQL
    _shared_mem_tokens: dict[str, APITokenRecord] = {}
    _shared_mem_audit_logs: list[dict] = []

    def __init__(self, dsn: Optional[str] = None):
        self.dsn = dsn or os.environ.get("DATABASE_URL")

    def _get_db_conn(self):
        if not self.dsn:
            return None
        try:
            import psycopg2
            return psycopg2.connect(self.dsn)
        except Exception as e:
            logger.warning("Could not connect to PostgreSQL (%s), using in-memory token store", e)
            return None

    def issue_token(
        self,
        name: str,
        ttl_days: int = 90,
        capabilities: Optional[list[APITokenCapability]] = None,
        issuer_actor: str = "admin_cli",
    ) -> tuple[APITokenRecord, str]:
        """
        Issue a new API token.
        Returns (APITokenRecord, raw_token_string).
        Raw token is only returned once upon issuance.
        """
        if ttl_days < 1 or ttl_days > 365:
            raise ValueError("ttl_days must be between 1 and 365 days")

        raw_token = generate_raw_token()
        token_hash = hash_token(raw_token)
        now = datetime.now(timezone.utc)
        expires_at = now + timedelta(days=ttl_days)
        caps = capabilities or [APITokenCapability.INCIDENT_SUBMIT]

        record = APITokenRecord(
            token_id=uuid4(),
            token_hash=token_hash,
            name=name,
            capabilities=caps,
            created_at=now,
            expires_at=expires_at,
            is_active=True,
            revoked_at=None,
        )

        conn = self._get_db_conn()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO healmesh.api_tokens
                        (token_id, token_hash, name, capabilities, created_at, expires_at, is_active)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        """,
                        (
                            str(record.token_id),
                            record.token_hash,
                            record.name,
                            json.dumps([c.value for c in record.capabilities]),
                            record.created_at,
                            record.expires_at,
                            record.is_active,
                        ),
                    )
                    # Write append-only audit event
                    cur.execute(
                        """
                        INSERT INTO healmesh.api_token_audit_logs
                        (token_id, event_type, actor, details, created_at)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (
                            str(record.token_id),
                            "TOKEN_ISSUED",
                            issuer_actor,
                            json.dumps({"name": record.name, "expires_at": record.expires_at.isoformat()}),
                            now,
                        ),
                    )
                conn.commit()
            except Exception as e:
                logger.error("DB error issuing token: %s", e)
                conn.rollback()
                self._shared_mem_tokens[token_hash] = record
            finally:
                conn.close()
        else:
            self._shared_mem_tokens[token_hash] = record
            self._shared_mem_audit_logs.append({
                "token_id": record.token_id,
                "event_type": "TOKEN_ISSUED",
                "actor": issuer_actor,
                "created_at": now,
            })

        return record, raw_token

    def get_token_by_hash(self, token_hash: str) -> Optional[APITokenRecord]:
        """Lookup token record by its SHA-256 hash."""
        conn = self._get_db_conn()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT token_id, token_hash, name, capabilities, created_at, expires_at, is_active, revoked_at
                        FROM healmesh.api_tokens
                        WHERE token_hash = %s
                        """,
                        (token_hash,),
                    )
                    row = cur.fetchone()
                    if row:
                        caps = [APITokenCapability(c) for c in (row[3] if isinstance(row[3], list) else json.loads(row[3]))]
                        return APITokenRecord(
                            token_id=UUID(str(row[0])),
                            token_hash=row[1],
                            name=row[2],
                            capabilities=caps,
                            created_at=row[4],
                            expires_at=row[5],
                            is_active=row[6],
                            revoked_at=row[7],
                        )
            except Exception as e:
                logger.error("DB error looking up token: %s", e)
            finally:
                conn.close()

        return self._shared_mem_tokens.get(token_hash)

    def revoke_token(self, token_id: UUID | str, revoked_by: str = "admin_cli") -> bool:
        """Revoke a token by its UUID."""
        tid_str = str(token_id)
        now = datetime.now(timezone.utc)
        conn = self._get_db_conn()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        UPDATE healmesh.api_tokens
                        SET is_active = FALSE, revoked_at = %s
                        WHERE token_id = %s AND is_active = TRUE
                        """,
                        (now, tid_str),
                    )
                    updated = cur.rowcount > 0
                    if updated:
                        cur.execute(
                            """
                            INSERT INTO healmesh.api_token_audit_logs
                            (token_id, event_type, actor, details, created_at)
                            VALUES (%s, %s, %s, %s, %s)
                            """,
                            (tid_str, "TOKEN_REVOKED", revoked_by, json.dumps({"revoked_at": now.isoformat()}), now),
                        )
                    conn.commit()
                    return updated
            except Exception as e:
                logger.error("DB error revoking token: %s", e)
                conn.rollback()
            finally:
                conn.close()

        # In-memory fallback
        for record in self._shared_mem_tokens.values():
            if str(record.token_id) == tid_str and record.is_active:
                record.is_active = False
                record.revoked_at = now
                self._shared_mem_audit_logs.append({
                    "token_id": record.token_id,
                    "event_type": "TOKEN_REVOKED",
                    "actor": revoked_by,
                    "created_at": now,
                })
                return True
        return False

    def list_tokens(self) -> list[APITokenRecord]:
        """List all tokens."""
        conn = self._get_db_conn()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        SELECT token_id, token_hash, name, capabilities, created_at, expires_at, is_active, revoked_at
                        FROM healmesh.api_tokens
                        ORDER BY created_at DESC
                        """
                    )
                    rows = cur.fetchall()
                    records = []
                    for row in rows:
                        caps = [APITokenCapability(c) for c in (row[3] if isinstance(row[3], list) else json.loads(row[3]))]
                        records.append(
                            APITokenRecord(
                                token_id=UUID(str(row[0])),
                                token_hash=row[1],
                                name=row[2],
                                capabilities=caps,
                                created_at=row[4],
                                expires_at=row[5],
                                is_active=row[6],
                                revoked_at=row[7],
                            )
                        )
                    return records
            except Exception as e:
                logger.error("DB error listing tokens: %s", e)
            finally:
                conn.close()

        return sorted(list(self._shared_mem_tokens.values()), key=lambda t: t.created_at, reverse=True)

    def log_auth_failure(self, actor: str, reason: str, client_ip: str = "unknown", token_id: Optional[UUID] = None):
        """Record an immutable TOKEN_AUTH_FAILED event."""
        now = datetime.now(timezone.utc)
        conn = self._get_db_conn()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute(
                        """
                        INSERT INTO healmesh.api_token_audit_logs
                        (token_id, event_type, actor, details, created_at)
                        VALUES (%s, %s, %s, %s, %s)
                        """,
                        (
                            str(token_id) if token_id else None,
                            "TOKEN_AUTH_FAILED",
                            actor,
                            json.dumps({"reason": reason, "client_ip": client_ip}),
                            now,
                        ),
                    )
                conn.commit()
            except Exception as e:
                logger.error("DB error logging auth failure: %s", e)
            finally:
                conn.close()
        else:
            self._shared_mem_audit_logs.append({
                "token_id": token_id,
                "event_type": "TOKEN_AUTH_FAILED",
                "actor": actor,
                "reason": reason,
                "client_ip": client_ip,
                "created_at": now,
            })
