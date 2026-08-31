"""
healmesh-sdk/tests/test_client.py

Unit tests for HealMeshClient and AsyncHealMeshClient using httpx.MockTransport.
"""
import json
from uuid import uuid4
import httpx
import pytest

from healmesh_sdk import (
    AsyncHealMeshClient,
    AuthenticationError,
    FailureType,
    HealMeshClient,
    HealMeshError,
    PayloadTooLargeError,
    PermissionDeniedError,
    RateLimitExceededError,
    ServerError,
    ValidationError,
)


def create_mock_diagnosis_dict():
    return {
        "incident_id": str(uuid4()),
        "diagnosis_id": str(uuid4()),
        "status": "diagnosed",
        "message": "Diagnosis complete (SDK diagnosis-only mode)",
        "diagnosis": {
            "diagnosis_id": str(uuid4()),
            "incident_id": str(uuid4()),
            "created_at": "2026-08-22T10:00:00Z",
            "root_cause": "PostgreSQL connection refused on port 5432",
            "confidence": "high",
            "suggested_manual_command": "kubectl logs pod-1 -n default",
            "parsed_action": {
                "action_type": "NONE",
                "params": None,
                "parse_failed": False,
                "parse_error": None,
            },
            "llm_model": "llama-3.1-8b-instant",
            "latency_ms": 320,
        },
    }


def test_sync_client_success():
    mock_data = create_mock_diagnosis_dict()

    def mock_handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/v1/sdk/incident"
        assert request.headers["authorization"] == "Bearer hm_live_test123"
        body = json.loads(request.content)
        assert body["namespace"] == "default"
        assert body["failure_type"] == "CrashLoopBackOff"
        assert body["container_name"] == "web"
        assert body["image"] == "web:v1.0"
        return httpx.Response(200, json=mock_data)

    transport = httpx.MockTransport(mock_handler)
    client = HealMeshClient(api_token="hm_live_test123", base_url="https://api.healmesh.local", transport=transport)
    res = client.diagnose_incident(
        namespace="default",
        pod_name="web-api-1",
        failure_type=FailureType.CRASH_LOOP_BACK_OFF,
        log_lines=["panic: connection refused"],
        container_name="web",
        image="web:v1.0",
        extra_context={"env": "prod"},
    )

    assert res.status == "diagnosed"
    assert res.diagnosis is not None
    assert res.diagnosis.root_cause == "PostgreSQL connection refused on port 5432"
    assert res.diagnosis.confidence.value == "high"
    assert res.diagnosis.parsed_action.action_type.value == "NONE"


@pytest.mark.asyncio
async def test_async_client_success():
    mock_data = create_mock_diagnosis_dict()

    def mock_handler(request: httpx.Request) -> httpx.Response:
        assert request.url.path == "/api/v1/sdk/incident"
        return httpx.Response(200, json=mock_data)

    transport = httpx.MockTransport(mock_handler)
    client = AsyncHealMeshClient(api_token="hm_live_test123", base_url="https://api.healmesh.local", transport=transport)
    res = await client.diagnose_incident(
        namespace="default",
        pod_name="web-api-1",
        failure_type="CrashLoopBackOff",
        log_lines=["panic: connection refused"],
        container_name="web",
        image="web:v1.0",
        extra_context={"env": "staging"},
    )

    assert res.status == "diagnosed"
    assert res.diagnosis.root_cause == "PostgreSQL connection refused on port 5432"


def test_client_authentication_error():
    transport = httpx.MockTransport(lambda req: httpx.Response(401, json={"detail": "Invalid API token."}))
    client = HealMeshClient(api_token="hm_live_invalid", transport=transport)
    with pytest.raises(AuthenticationError) as exc:
        client.diagnose_incident(
            namespace="default",
            pod_name="pod-1",
            failure_type="CrashLoopBackOff",
        )
    assert "401" in str(exc.value)


def test_client_permission_denied_error():
    transport = httpx.MockTransport(lambda req: httpx.Response(403, json={"detail": "Token lacks INCIDENT_SUBMIT capability"}))
    client = HealMeshClient(api_token="hm_live_nocaps", transport=transport)
    with pytest.raises(PermissionDeniedError) as exc:
        client.diagnose_incident(
            namespace="default",
            pod_name="pod-1",
            failure_type="CrashLoopBackOff",
        )
    assert "403" in str(exc.value)


def test_client_rate_limit_error():
    transport = httpx.MockTransport(lambda req: httpx.Response(429, json={"detail": "Per-token rate limit exceeded"}))
    client = HealMeshClient(api_token="hm_live_flooder", transport=transport)
    with pytest.raises(RateLimitExceededError) as exc:
        client.diagnose_incident(
            namespace="default",
            pod_name="pod-1",
            failure_type="OOMKilled",
        )
    assert "429" in str(exc.value)


def test_client_validation_error():
    transport = httpx.MockTransport(lambda req: httpx.Response(422, json={"detail": "Namespace 'kube-system' is protected"}))
    client = HealMeshClient(api_token="hm_live_valid", transport=transport)
    with pytest.raises(ValidationError) as exc:
        client.diagnose_incident(
            namespace="kube-system",
            pod_name="coredns-1",
            failure_type="CrashLoopBackOff",
        )
    assert "422" in str(exc.value)


def test_client_payload_too_large_error():
    transport = httpx.MockTransport(lambda req: httpx.Response(413, json={"detail": "Body exceeds 64 KB"}))
    client = HealMeshClient(api_token="hm_live_valid", transport=transport)
    with pytest.raises(PayloadTooLargeError) as exc:
        client.diagnose_incident(
            namespace="default",
            pod_name="pod-1",
            failure_type="OOMKilled",
        )
    assert "413" in str(exc.value)


def test_client_server_error():
    transport = httpx.MockTransport(lambda req: httpx.Response(500, text="Internal Server Error"))
    client = HealMeshClient(api_token="hm_live_valid", transport=transport)
    with pytest.raises(ServerError) as exc:
        client.diagnose_incident(
            namespace="default",
            pod_name="pod-1",
            failure_type="OOMKilled",
        )
    assert "500" in str(exc.value)


def test_client_generic_error():
    transport = httpx.MockTransport(lambda req: httpx.Response(418, text="I'm a teapot"))
    client = HealMeshClient(api_token="hm_live_valid", transport=transport)
    with pytest.raises(HealMeshError) as exc:
        client.diagnose_incident(
            namespace="default",
            pod_name="pod-1",
            failure_type="OOMKilled",
        )
    assert "418" in str(exc.value)
