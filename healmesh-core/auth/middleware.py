"""
healmesh-core/auth/middleware.py

FastAPI dependency for verifying SDK Bearer tokens, checking scopes,
enforcing TLS ingress rules, and checking hierarchical rate limits.
"""
from __future__ import annotations

import logging
import os
from fastapi import HTTPException, Request, Security, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from auth.rate_limiter import HierarchicalSDKRateLimiter
from auth.token_repo import TokenRepository, hash_token
from schema.models import APITokenCapability, APITokenRecord

logger = logging.getLogger(__name__)

_security = HTTPBearer(auto_error=False)

# Singletons for dependency injection
_token_repo = TokenRepository()
_rate_limiter = HierarchicalSDKRateLimiter()


def get_token_repo() -> TokenRepository:
    return _token_repo


def get_rate_limiter() -> HierarchicalSDKRateLimiter:
    return _rate_limiter


def enforce_tls_ingress(request: Request):
    """
    Assert that the request arrived over HTTPS (TLS 1.2+).
    In local dev / testing (HEALMESH_ENV=test or localhost), TLS enforcement is relaxed.
    """
    env = os.environ.get("HEALMESH_ENV", "production").lower()
    if env in ("test", "development", "local"):
        return

    # Check scheme or reverse-proxy TLS termination header
    proto = request.headers.get("x-forwarded-proto", request.url.scheme).lower()
    if proto != "https":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="HTTPS connection required. Plain HTTP is strictly forbidden.",
        )


async def authenticate_sdk_token(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Security(_security),
) -> APITokenRecord:
    """
    FastAPI dependency that validates an incoming SDK Bearer token.
    Fails fast with HTTP 401, 403, or 429.
    """
    # 1. Enforce TLS requirement
    enforce_tls_ingress(request)

    client_ip = request.client.host if request.client else "unknown"

    # 2. Extract Bearer token
    if not credentials or not credentials.credentials:
        _token_repo.log_auth_failure(actor="unauthenticated", reason="missing_bearer_token", client_ip=client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization: Bearer <token> header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    raw_token = credentials.credentials.strip()
    if not raw_token.startswith("hm_live_"):
        _token_repo.log_auth_failure(actor="invalid_token_format", reason="malformed_prefix", client_ip=client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API token format. Must begin with 'hm_live_'.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 3. Lookup by SHA-256 hash
    token_hash = hash_token(raw_token)
    token_record = _token_repo.get_token_by_hash(token_hash)

    if not token_record:
        _token_repo.log_auth_failure(actor="unknown_token", reason="token_not_found", client_ip=client_ip)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid API token.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 4. Check active, expiry, revocation
    is_valid, reason = token_record.is_valid()
    if not is_valid:
        _token_repo.log_auth_failure(
            actor=f"sdk_token:{token_record.token_id}",
            reason=reason or "invalid_token",
            client_ip=client_ip,
            token_id=token_record.token_id,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"API token rejected: {reason}.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 5. Check capability scope (Zero-Trust: INCIDENT_SUBMIT only)
    if APITokenCapability.INCIDENT_SUBMIT not in token_record.capabilities:
        _token_repo.log_auth_failure(
            actor=f"sdk_token:{token_record.token_id}",
            reason="insufficient_capabilities",
            client_ip=client_ip,
            token_id=token_record.token_id,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="API token does not possess the required 'INCIDENT_SUBMIT' capability.",
        )

    # 6. Check Hierarchical Rate Limiting (Per-Token + Aggregate SDK)
    allowed, rate_err = _rate_limiter.check_and_record(str(token_record.token_id))
    if not allowed:
        logger.warning("SDK rate limit exceeded for token %s (%s): %s", token_record.token_id, token_record.name, rate_err)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=rate_err,
        )

    return token_record
