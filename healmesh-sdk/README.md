# HealMesh Python Client SDK (`healmesh-sdk`)

The official Python client library for [HealMesh](https://github.com/healmesh/healmesh) — Autonomous Kubernetes AI Diagnosis.

---

## 1. Installation

```bash
pip install healmesh-sdk
```

---

## 2. Quickstart

### Synchronous Client

```python
from healmesh_sdk import HealMeshClient, FailureType

# Initialize client with your scoped API Token
client = HealMeshClient(
    api_token="hm_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    base_url="https://api.healmesh.internal",
)

# Submit an incident for AI root-cause diagnosis
response = client.diagnose_incident(
    namespace="production",
    pod_name="payment-service-6f8d7f-9k2pq",
    failure_type=FailureType.CRASH_LOOP_BACK_OFF,
    container_name="payment",
    log_lines=[
        "2026-08-22T10:14:02Z INFO Starting payment worker v2.1.0",
        "2026-08-22T10:14:03Z ERROR connect ECONNREFUSED 10.0.15.23:5432",
        "2026-08-22T10:14:03Z FATAL panic: database connection failed",
    ],
)

print(f"Status: {response.status}")
if response.diagnosis:
    print(f"Root Cause: {response.diagnosis.root_cause}")
    print(f"Confidence: {response.diagnosis.confidence.value}")
    print(f"Suggested Command: {response.diagnosis.suggested_manual_command}")
    print(f"Action Enum: {response.diagnosis.parsed_action.action_type.value}")
```

### Asynchronous Client

```python
import asyncio
from healmesh_sdk import AsyncHealMeshClient, FailureType

async def main():
    client = AsyncHealMeshClient(
        api_token="hm_live_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
        base_url="https://api.healmesh.internal",
    )

    response = await client.diagnose_incident(
        namespace="analytics",
        pod_name="worker-7bc3d2-kn4ql",
        failure_type=FailureType.OOM_KILLED,
        log_lines=["Killed (OOM)"],
    )

    if response.diagnosis:
        print("Root cause:", response.diagnosis.root_cause)

asyncio.run(main())
```

---

## 3. Architecture & Security Invariants (ADR-013)

- **Diagnosis-Only Execution**: SDK-submitted incidents will never trigger cluster mutations or automated remediation.
- **Strict Size Bounds**: Payloads are capped to ≤ 64 KB and ≤ 50 log lines.
- **Automated Secret Redaction**: Secrets and Bearer tokens are scrubbed automatically before diagnosis.
- **Direct HTTP Communication**: Direct `httpx` client only — zero LangChain, n8n, or heavy middleman dependencies.
