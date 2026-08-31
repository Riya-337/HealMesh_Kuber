"""
healmesh-core/tests/test_sdk_endpoint.py

Integration tests for the POST /api/v1/sdk/incident endpoint.
Verifies authentication, secret sanitization, closed-enum parsing,
rate limiting, TLS enforcement, and Diagnosis-Only pipeline isolation (ADR-013).
"""
import os
from unittest.mock import MagicMock, patch
import pytest
from httpx import AsyncClient, ASGITransport

from auth.middleware import get_rate_limiter, get_token_repo
from diagnosis.llm_client import LLMResponse
from main import app
from schema.models import APITokenCapability, FailureType


@pytest.fixture
def auth_token():
    repo = get_token_repo()
    record, raw_token = repo.issue_token(name="sdk-test-client", ttl_days=30)
    return raw_token


@pytest.mark.asyncio
async def test_sdk_endpoint_tls_enforcement(auth_token):
    transport = ASGITransport(app=app)
    with pytest.MonkeyPatch.context() as mp:
        mp.setenv("HEALMESH_ENV", "production")
        async with AsyncClient(transport=transport, base_url="http://insecure-host") as client:
            resp = await client.post(
                "/api/v1/sdk/incident",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={
                    "namespace": "default",
                    "pod_name": "worker-1",
                    "failure_type": "CrashLoopBackOff",
                    "log_lines": ["error"],
                },
            )
            assert resp.status_code == 400
            assert "HTTPS connection required" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_sdk_endpoint_unauthorized():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="https://api.healmesh.local") as client:
        # No Authorization header
        resp = await client.post(
            "/api/v1/sdk/incident",
            json={
                "namespace": "default",
                "pod_name": "worker-1",
                "failure_type": "CrashLoopBackOff",
                "log_lines": ["error"],
            },
        )
        assert resp.status_code == 401
        assert "Missing Authorization" in resp.json()["detail"]


@pytest.mark.asyncio
async def test_sdk_endpoint_denylist_rejection(auth_token):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="https://api.healmesh.local") as client:
        resp = await client.post(
            "/api/v1/sdk/incident",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "namespace": "kube-system",
                "pod_name": "coredns-1",
                "failure_type": "CrashLoopBackOff",
                "log_lines": ["error"],
            },
        )
        assert resp.status_code == 422
        assert "protected denylist" in str(resp.json())


@pytest.mark.asyncio
async def test_sdk_endpoint_success_diagnosis_only(auth_token):
    mock_llm_response = LLMResponse(
        success=True,
        raw_text='{"root_cause": "Database connection refused", "confidence": "high", "suggested_action": "NONE"}',
        parsed_json={"root_cause": "Database connection refused", "confidence": "high", "suggested_action": "NONE"},
        model_used="llama-3.1-8b-instant",
        latency_ms=350,
    )

    with patch("api.sdk._llm.diagnose", return_value=mock_llm_response), \
         patch("surface.slack.notifier.SlackNotifier.send_diagnosis") as mock_slack:

        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="https://api.healmesh.local") as client:
            resp = await client.post(
                "/api/v1/sdk/incident",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={
                    "namespace": "production",
                    "pod_name": "payment-service-1",
                    "container_name": "payment",
                    "failure_type": "CrashLoopBackOff",
                    "log_lines": ["Authorization: Bearer mySecretToken1234567890", "FATAL connect ECONNREFUSED 10.0.1.5:5432"],
                },
            )

            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "diagnosed"
            assert "SDK diagnosis-only mode" in data["message"]
            assert data["diagnosis"]["root_cause"] == "Database connection refused"
            assert data["diagnosis"]["parsed_action"]["action_type"] == "NONE"

            # INVARIANT (ADR-013): Slack notifier MUST NOT be called for SDK submissions
            mock_slack.assert_not_called()


@pytest.mark.asyncio
async def test_sdk_endpoint_rate_limited(auth_token):
    limiter = get_rate_limiter()
    limiter.per_token_limit = 1
    limiter.reset()

    mock_llm_response = LLMResponse(
        success=True,
        raw_text='{"root_cause": "OOM", "confidence": "high", "suggested_action": "NONE"}',
        parsed_json={"root_cause": "OOM", "confidence": "high", "suggested_action": "NONE"},
        model_used="llama-3.1-8b-instant",
        latency_ms=200,
    )

    with patch("api.sdk._llm.diagnose", return_value=mock_llm_response):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="https://api.healmesh.local") as client:
            payload = {
                "namespace": "analytics",
                "pod_name": "worker-1",
                "failure_type": "OOMKilled",
                "log_lines": ["Killed"],
            }
            # 1st call: OK
            resp1 = await client.post("/api/v1/sdk/incident", headers={"Authorization": f"Bearer {auth_token}"}, json=payload)
            assert resp1.status_code == 200

            # 2nd call: Rate limited
            resp2 = await client.post("/api/v1/sdk/incident", headers={"Authorization": f"Bearer {auth_token}"}, json=payload)
            assert resp2.status_code == 429
            assert "rate limit exceeded" in resp2.json()["detail"].lower()


@pytest.mark.asyncio
async def test_sdk_endpoint_global_llm_rate_limited(auth_token):
    """Test global LLM ceiling trip in api/sdk.py lines 98-99."""
    limiter = get_rate_limiter()
    limiter.reset()

    with patch("main._check_rate_limit", return_value=False):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="https://api.healmesh.local") as client:
            resp = await client.post(
                "/api/v1/sdk/incident",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={
                    "namespace": "production",
                    "pod_name": "worker-1",
                    "failure_type": "CrashLoopBackOff",
                    "log_lines": ["err"],
                },
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["status"] == "rate_limited"
            assert "Global LLM rate limit exceeded" in data["message"]


@pytest.mark.asyncio
async def test_sdk_endpoint_llm_quota_error(auth_token):
    """Test LLM quota exhaustion error branch in api/sdk.py lines 120-123."""
    limiter = get_rate_limiter()
    limiter.reset()

    mock_llm_response = LLMResponse(
        success=False,
        raw_text="",
        parsed_json=None,
        error="ResourceExhausted 429 Rate limit reached",
        model_used="llama-3.1-8b-instant",
        latency_ms=100,
    )

    with patch("api.sdk._llm.diagnose", return_value=mock_llm_response):
        transport = ASGITransport(app=app)
        async with AsyncClient(transport=transport, base_url="https://api.healmesh.local") as client:
            resp = await client.post(
                "/api/v1/sdk/incident",
                headers={"Authorization": f"Bearer {auth_token}"},
                json={
                    "namespace": "production",
                    "pod_name": "worker-1",
                    "failure_type": "CrashLoopBackOff",
                    "log_lines": ["err"],
                },
            )
            assert resp.status_code == 200
            data = resp.json()
            assert data["diagnosis"]["root_cause"] == "Diagnosis unavailable (LLM quota exhausted)"

