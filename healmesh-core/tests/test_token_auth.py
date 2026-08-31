"""
healmesh-core/tests/test_token_auth.py

Unit tests for API Token lifecycle, hierarchical rate limiter, and
FastAPI authentication dependency.
"""
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock
from uuid import uuid4
import pytest
from fastapi import HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials

from auth.middleware import authenticate_sdk_token, enforce_tls_ingress, get_rate_limiter, get_token_repo
from auth.rate_limiter import HierarchicalSDKRateLimiter
from auth.token_repo import TokenRepository, hash_token
from schema.models import APITokenCapability, APITokenRecord


# -----------------------------------------------------------------------------
# 1. TokenRepository Unit Tests
# -----------------------------------------------------------------------------

def test_token_repo_issue_and_lookup():
    repo = TokenRepository()
    record, raw_token = repo.issue_token(name="ci-pipeline", ttl_days=30)

    assert raw_token.startswith("hm_live_")
    assert record.name == "ci-pipeline"
    assert record.is_active is True
    assert record.capabilities == [APITokenCapability.INCIDENT_SUBMIT]

    # Verify SHA-256 hash match
    token_hash = hash_token(raw_token)
    assert token_hash == record.token_hash

    # Lookup
    found = repo.get_token_by_hash(token_hash)
    assert found is not None
    assert found.token_id == record.token_id


def test_token_repo_revoke():
    repo = TokenRepository()
    record, raw_token = repo.issue_token(name="test-token", ttl_days=10)

    assert repo.revoke_token(record.token_id) is True
    found = repo.get_token_by_hash(record.token_hash)
    assert found.is_active is False
    assert found.revoked_at is not None

    # Revoking already inactive token returns False
    assert repo.revoke_token(record.token_id) is False


def test_token_repo_list_tokens():
    repo = TokenRepository()
    t1, _ = repo.issue_token(name="token-1", ttl_days=10)
    t2, _ = repo.issue_token(name="token-2", ttl_days=20)

    tokens = repo.list_tokens()
    names = [t.name for t in tokens]
    assert "token-1" in names
    assert "token-2" in names


def test_token_repo_ttl_validation():
    repo = TokenRepository()
    with pytest.raises(ValueError):
        repo.issue_token(name="bad-ttl", ttl_days=0)
    with pytest.raises(ValueError):
        repo.issue_token(name="bad-ttl", ttl_days=400)


def test_token_repo_auth_failure_logging():
    repo = TokenRepository()
    repo.log_auth_failure(actor="attacker", reason="bad_token", client_ip="192.168.1.1")
    assert len(TokenRepository._shared_mem_audit_logs) >= 1
    assert any(log["actor"] == "attacker" for log in TokenRepository._shared_mem_audit_logs)


def test_token_repo_with_mocked_db():
    mock_cursor = MagicMock()
    mock_cursor.rowcount = 1
    mock_cursor.fetchone.return_value = (
        str(uuid4()),
        "e" * 64,
        "db-token",
        '["INCIDENT_SUBMIT"]',
        datetime.now(timezone.utc),
        datetime.now(timezone.utc) + timedelta(days=10),
        True,
        None,
    )
    mock_cursor.fetchall.return_value = [
        (
            str(uuid4()),
            "e" * 64,
            "db-token",
            '["INCIDENT_SUBMIT"]',
            datetime.now(timezone.utc),
            datetime.now(timezone.utc) + timedelta(days=10),
            True,
            None,
        )
    ]
    mock_conn = MagicMock()
    mock_conn.cursor.return_value.__enter__.return_value = mock_cursor

    repo = TokenRepository(dsn="postgresql://fake:fake@localhost:5432/fake")
    repo._get_db_conn = MagicMock(return_value=mock_conn)

    # 1. Issue
    rec, raw = repo.issue_token("db-test-token", ttl_days=15)
    assert rec.name == "db-test-token"
    mock_conn.commit.assert_called()

    # 2. Get by hash
    found = repo.get_token_by_hash("e" * 64)
    assert found is not None
    assert found.name == "db-token"

    # 3. Revoke
    assert repo.revoke_token(rec.token_id) is True

    # 4. List
    listed = repo.list_tokens()
    assert len(listed) == 1
    assert listed[0].name == "db-token"

    # 5. Auth failure
    repo.log_auth_failure(actor="bad_actor", reason="wrong_creds")
    mock_cursor.execute.assert_called()


# -----------------------------------------------------------------------------
# 2. HierarchicalSDKRateLimiter Tests
# -----------------------------------------------------------------------------

def test_hierarchical_rate_limiter_per_token():
    limiter = HierarchicalSDKRateLimiter(per_token_limit=3, aggregate_limit=10, window_seconds=60.0)
    token_id = "tok-123"

    assert limiter.check_and_record(token_id)[0] is True
    assert limiter.check_and_record(token_id)[0] is True
    assert limiter.check_and_record(token_id)[0] is True

    # 4th call exceeds per-token limit
    allowed, err = limiter.check_and_record(token_id)
    assert allowed is False
    assert "Per-token rate limit exceeded" in err


def test_hierarchical_rate_limiter_aggregate():
    limiter = HierarchicalSDKRateLimiter(per_token_limit=5, aggregate_limit=4, window_seconds=60.0)

    # 2 tokens making 2 calls each = 4 calls total
    assert limiter.check_and_record("tok-A")[0] is True
    assert limiter.check_and_record("tok-A")[0] is True
    assert limiter.check_and_record("tok-B")[0] is True
    assert limiter.check_and_record("tok-B")[0] is True

    # 5th call from a brand new token exceeds aggregate limit
    allowed, err = limiter.check_and_record("tok-C")
    assert allowed is False
    assert "Aggregate SDK rate limit exceeded" in err


# -----------------------------------------------------------------------------
# 3. authenticate_sdk_token Middleware Tests
# -----------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_auth_middleware_missing_credentials():
    mock_request = MagicMock(spec=Request)
    mock_request.url.scheme = "https"
    mock_request.headers = {"x-forwarded-proto": "https"}
    mock_request.client.host = "127.0.0.1"

    with pytest.raises(HTTPException) as exc:
        await authenticate_sdk_token(mock_request, credentials=None)
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Missing Authorization" in exc.value.detail


@pytest.mark.asyncio
async def test_auth_middleware_malformed_token():
    mock_request = MagicMock(spec=Request)
    mock_request.url.scheme = "https"
    mock_request.headers = {"x-forwarded-proto": "https"}
    mock_request.client.host = "127.0.0.1"

    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="invalid_prefix_123")
    with pytest.raises(HTTPException) as exc:
        await authenticate_sdk_token(mock_request, credentials=creds)
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Must begin with 'hm_live_'" in exc.value.detail


@pytest.mark.asyncio
async def test_auth_middleware_valid_token():
    repo = get_token_repo()
    limiter = get_rate_limiter()
    limiter.reset()

    record, raw_token = repo.issue_token(name="valid-ci-token", ttl_days=30)

    mock_request = MagicMock(spec=Request)
    mock_request.url.scheme = "https"
    mock_request.headers = {"x-forwarded-proto": "https"}
    mock_request.client.host = "127.0.0.1"

    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=raw_token)
    authenticated_record = await authenticate_sdk_token(mock_request, credentials=creds)

    assert authenticated_record.token_id == record.token_id
    assert authenticated_record.name == "valid-ci-token"


@pytest.mark.asyncio
async def test_auth_middleware_unknown_token():
    mock_request = MagicMock(spec=Request)
    mock_request.url.scheme = "https"
    mock_request.headers = {"x-forwarded-proto": "https"}
    mock_request.client.host = "127.0.0.1"

    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials="hm_live_" + "f" * 64)
    with pytest.raises(HTTPException) as exc:
        await authenticate_sdk_token(mock_request, credentials=creds)
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "Invalid API token" in exc.value.detail


@pytest.mark.asyncio
async def test_auth_middleware_revoked_token():
    repo = get_token_repo()
    record, raw_token = repo.issue_token(name="revoked-ci-token", ttl_days=30)
    repo.revoke_token(record.token_id)

    mock_request = MagicMock(spec=Request)
    mock_request.url.scheme = "https"
    mock_request.headers = {"x-forwarded-proto": "https"}
    mock_request.client.host = "127.0.0.1"

    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=raw_token)
    with pytest.raises(HTTPException) as exc:
        await authenticate_sdk_token(mock_request, credentials=creds)
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "revoked" in exc.value.detail.lower()


@pytest.mark.asyncio
async def test_auth_middleware_expired_token():
    repo = get_token_repo()
    record, raw_token = repo.issue_token(name="expired-ci-token", ttl_days=30)
    # Manually expire the record in the repo
    now = datetime.now(timezone.utc)
    record.expires_at = now - timedelta(days=1)

    mock_request = MagicMock(spec=Request)
    mock_request.url.scheme = "https"
    mock_request.headers = {"x-forwarded-proto": "https"}
    mock_request.client.host = "127.0.0.1"

    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=raw_token)
    with pytest.raises(HTTPException) as exc:
        await authenticate_sdk_token(mock_request, credentials=creds)
    assert exc.value.status_code == status.HTTP_401_UNAUTHORIZED
    assert "expired" in exc.value.detail.lower()


@pytest.mark.asyncio
async def test_auth_middleware_insufficient_capabilities():
    repo = get_token_repo()
    record, raw_token = repo.issue_token(name="no-caps-token", ttl_days=30)
    record.capabilities = []  # Remove all capabilities

    mock_request = MagicMock(spec=Request)
    mock_request.url.scheme = "https"
    mock_request.headers = {"x-forwarded-proto": "https"}
    mock_request.client.host = "127.0.0.1"

    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=raw_token)
    with pytest.raises(HTTPException) as exc:
        await authenticate_sdk_token(mock_request, credentials=creds)
    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert "INCIDENT_SUBMIT" in exc.value.detail


@pytest.mark.asyncio
async def test_auth_middleware_rate_limited():
    repo = get_token_repo()
    record, raw_token = repo.issue_token(name="rate-limited-token", ttl_days=30)
    limiter = get_rate_limiter()
    limiter.per_token_limit = 1
    limiter.reset()

    mock_request = MagicMock(spec=Request)
    mock_request.url.scheme = "https"
    mock_request.headers = {"x-forwarded-proto": "https"}
    mock_request.client.host = "127.0.0.1"

    creds = HTTPAuthorizationCredentials(scheme="Bearer", credentials=raw_token)
    # 1st call succeeds
    await authenticate_sdk_token(mock_request, credentials=creds)
    # 2nd call fails with 429
    with pytest.raises(HTTPException) as exc:
        await authenticate_sdk_token(mock_request, credentials=creds)
    assert exc.value.status_code == status.HTTP_429_TOO_MANY_REQUESTS


def test_enforce_tls_ingress():
    # In production env, plain HTTP must be rejected
    import os
    with pytest.MonkeyPatch.context() as mp:
        mp.setenv("HEALMESH_ENV", "production")
        mock_req = MagicMock(spec=Request)
        mock_req.url.scheme = "http"
        mock_req.headers = {}
        with pytest.raises(HTTPException) as exc:
            enforce_tls_ingress(mock_req)
        assert exc.value.status_code == status.HTTP_400_BAD_REQUEST
        assert "HTTPS connection required" in exc.value.detail

        # In dev/test env, TLS enforcement is relaxed
        mp.setenv("HEALMESH_ENV", "test")
        enforce_tls_ingress(mock_req)  # Should return without raising


def test_token_repo_db_error_fallbacks():
    """Verify that DB exceptions trigger rollbacks and fall back cleanly to memory."""
    mock_conn = MagicMock()
    mock_conn.cursor.side_effect = Exception("DB Connection Lost")

    repo = TokenRepository(dsn="postgresql://fake:fake@localhost:5432/fake")
    repo._get_db_conn = MagicMock(return_value=mock_conn)

    # 1. Issue with DB failure
    rec, raw = repo.issue_token("fallback-token", ttl_days=10)
    assert rec.name == "fallback-token"
    mock_conn.rollback.assert_called()

    # 2. Get by hash with DB failure
    found = repo.get_token_by_hash(rec.token_hash)
    assert found is not None
    assert found.name == "fallback-token"

    # 3. Revoke with DB failure
    assert repo.revoke_token(rec.token_id) is True

    # 4. List with DB failure
    tokens = repo.list_tokens()
    assert len(tokens) >= 1

    # 5. Log auth failure with DB failure
    repo.log_auth_failure("test_actor", "some_reason")


def test_token_repo_get_db_conn_failure():
    """Verify that _get_db_conn returns None gracefully when psycopg2.connect fails."""
    import psycopg2
    from unittest.mock import patch

    repo = TokenRepository(dsn="postgresql://invalid:5432/bad_db")
    with patch("psycopg2.connect", side_effect=psycopg2.OperationalError("Connection refused")):
        conn = repo._get_db_conn()
        assert conn is None


