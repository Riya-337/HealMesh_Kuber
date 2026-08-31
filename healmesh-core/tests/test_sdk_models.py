"""
healmesh-core/tests/test_sdk_models.py

Unit tests for SDK models, strict size bounds, and DNS validation.
"""
from datetime import datetime, timedelta, timezone
from uuid import uuid4
import pytest
from pydantic import ValidationError

from schema.models import (
    APITokenCapability,
    APITokenRecord,
    FailureType,
    SDKIncidentSubmitRequest,
    TokenIssuedResponse,
)


def test_api_token_record_validity():
    now = datetime.now(timezone.utc)
    # Active valid token
    rec = APITokenRecord(
        token_id=uuid4(),
        token_hash="a" * 64,
        name="test-token",
        capabilities=[APITokenCapability.INCIDENT_SUBMIT],
        created_at=now,
        expires_at=now + timedelta(days=30),
        is_active=True,
    )
    is_valid, reason = rec.is_valid()
    assert is_valid is True
    assert reason is None

    # Expired token
    rec_expired = APITokenRecord(
        token_id=uuid4(),
        token_hash="b" * 64,
        name="expired-token",
        capabilities=[APITokenCapability.INCIDENT_SUBMIT],
        created_at=now - timedelta(days=40),
        expires_at=now - timedelta(days=10),
        is_active=True,
    )
    is_valid, reason = rec_expired.is_valid()
    assert is_valid is False
    assert reason == "Token has expired"

    # Revoked token
    rec_revoked = APITokenRecord(
        token_id=uuid4(),
        token_hash="c" * 64,
        name="revoked-token",
        capabilities=[APITokenCapability.INCIDENT_SUBMIT],
        created_at=now,
        expires_at=now + timedelta(days=30),
        is_active=False,
        revoked_at=now,
    )
    is_valid, reason = rec_revoked.is_valid()
    assert is_valid is False
    assert reason == "Token has been revoked"


def test_sdk_incident_submit_request_validation():
    req = SDKIncidentSubmitRequest(
        namespace="staging",
        pod_name="api-gateway-7d8f9b-xk2pq",
        container_name="api-gateway",
        failure_type=FailureType.CRASH_LOOP_BACK_OFF,
        log_lines=["ERROR connect ECONNREFUSED 10.0.15.23:5432"],
    )
    assert req.namespace == "staging"
    assert req.pod_name == "api-gateway-7d8f9b-xk2pq"
    assert req.failure_type == FailureType.CRASH_LOOP_BACK_OFF
    assert len(req.log_lines) == 1


def test_sdk_incident_denylist_rejection():
    for denied in ["kube-system", "kube-public", "healmesh"]:
        with pytest.raises(ValidationError) as exc:
            SDKIncidentSubmitRequest(
                namespace=denied,
                pod_name="core-dns-123",
                failure_type=FailureType.CRASH_LOOP_BACK_OFF,
            )
        assert "protected denylist" in str(exc.value)


def test_sdk_incident_log_truncation():
    # Enforces max 50 lines and 200 chars per line
    long_line = "A" * 300
    many_lines = [f"line-{i}: {long_line}" for i in range(70)]

    req = SDKIncidentSubmitRequest(
        namespace="default",
        pod_name="worker-pod",
        failure_type=FailureType.OOM_KILLED,
        log_lines=many_lines,
    )

    assert len(req.log_lines) == 50
    for line in req.log_lines:
        assert len(line) <= 205  # 190 + " [TRUNCATED]"
        assert "[TRUNCATED]" in line
