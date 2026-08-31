"""
healmesh-core/api/sdk.py

External SDK Ingress Router.
Endpoint: POST /api/v1/sdk/incident

Pipeline:
  1. Authenticate Bearer token & check rate limits (via authenticate_sdk_token dependency)
  2. Validate payload size & RFC 1123 constraints (via SDKIncidentSubmitRequest)
  3. Redact secrets from log lines (via sanitize_log_lines)
  4. Write incident to append-only audit log (actor = "sdk_token:<id>")
  5. Check Global LLM budget rate limit
  6. Execute LLM diagnosis (Groq / Gemini)
  7. Parse action into closed enum
  8. Write diagnosis to append-only audit log
  9. Return typed diagnosis response directly to SDK caller (DIAGNOSIS-ONLY: NO Slack routing, NO executor execution)
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import ValidationError

from audit.logger import AuditLogger
from auth.middleware import authenticate_sdk_token
from auth.sanitizer import sanitize_log_lines
from diagnosis.llm_client import GeminiClient
from diagnosis.prompt_engine import build_diagnosis_prompt
from parser.action_parser import parse_confidence, parse_llm_response
from schema.models import (
    APITokenRecord,
    ContainerStatus,
    Diagnosis,
    IncidentPayload,
    IncidentSubmitResponse,
    SDKIncidentSubmitRequest,
)

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/sdk", tags=["sdk"])

_audit = AuditLogger()
_llm = GeminiClient()


@router.post("/incident", response_model=IncidentSubmitResponse)
async def submit_sdk_incident(
    payload: SDKIncidentSubmitRequest,
    request: Request,
    token: APITokenRecord = Depends(authenticate_sdk_token),
) -> IncidentSubmitResponse:
    """
    Ingress endpoint for programmatic SDK incident submission.
    Enforces token authentication, secret sanitization, size limits,
    and Diagnosis-Only pipeline semantics (ADR-013).
    """
    # 1. Secret scrubbing on log lines
    scrubbed_logs = sanitize_log_lines(payload.log_lines)

    # 2. Construct internal IncidentPayload
    incident_id = uuid4()
    container_statuses = []
    if payload.container_name:
        container_statuses.append(
            ContainerStatus(
                name=payload.container_name,
                image=payload.image or "unknown:latest",
                ready=False,
                restart_count=0,
            )
        )

    incident = IncidentPayload(
        incident_id=incident_id,
        namespace=payload.namespace,
        pod_name=payload.pod_name,
        image=payload.image,
        container_statuses=container_statuses,
        failure_type=payload.failure_type,
        log_lines=scrubbed_logs,
        detected_at=datetime.now(timezone.utc),
    )

    # 3. Log to append-only audit store with SDK actor
    try:
        _audit.log_incident(incident)
    except Exception as e:
        logger.error("Failed to audit log SDK incident %s: %s", incident_id, e)

    # 4. Check global core LLM rate limit
    from main import _check_rate_limit

    if not _check_rate_limit():
        logger.warning("Global LLM rate limit exceeded for SDK incident %s", incident_id)
        return IncidentSubmitResponse(
            incident_id=incident_id,
            diagnosis_id=uuid4(),
            status="rate_limited",
            message="Global LLM rate limit exceeded. Incident logged.",
        )

    # 5. Build prompt and run LLM diagnosis
    system_prompt, user_prompt = build_diagnosis_prompt(incident)
    llm_response = _llm.diagnose(system_prompt, user_prompt)
    prompt_snapshot = f"{system_prompt}\n\n---USER---\n{user_prompt}"

    # 6. Enforce closed-enum parsing
    parsed_action = parse_llm_response(llm_response.parsed_json)
    confidence = parse_confidence(llm_response.parsed_json)

    root_cause = "Diagnosis unavailable (LLM call failed)"
    suggested_command = None
    if llm_response.success and llm_response.parsed_json:
        root_cause = llm_response.parsed_json.get("root_cause", root_cause)
        suggested_command = llm_response.parsed_json.get("suggested_manual_command")
    elif not llm_response.success:
        err = (llm_response.error or "").lower()
        if "resourceexhausted" in err or "quota" in err or "429" in err:
            root_cause = "Diagnosis unavailable (LLM quota exhausted)"

    diagnosis = Diagnosis(
        incident_id=incident.incident_id,
        root_cause=root_cause,
        confidence=confidence,
        suggested_manual_command=suggested_command,
        parsed_action=parsed_action,
        llm_model=llm_response.model_used,
        latency_ms=llm_response.latency_ms,
    )

    # 7. Audit log the diagnosis
    try:
        _audit.log_diagnosis(diagnosis, prompt_snapshot)
    except Exception as e:
        logger.error("Failed to audit log SDK diagnosis %s: %s", diagnosis.diagnosis_id, e)

    # 8. DIAGNOSIS-ONLY PIPELINE INVARIANT (ADR-013):
    # Do NOT send to Slack, do NOT generate approval/execution tasks.

    return IncidentSubmitResponse(
        incident_id=incident.incident_id,
        diagnosis_id=diagnosis.diagnosis_id,
        status="diagnosed",
        message="Diagnosis complete (SDK diagnosis-only mode)",
        diagnosis=diagnosis,
    )
