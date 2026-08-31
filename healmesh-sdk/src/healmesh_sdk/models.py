"""
healmesh_sdk.models

Typed data models for SDK requests and responses.
"""
from __future__ import annotations

import enum
from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class FailureType(str, enum.Enum):
    """The canonical Kubernetes failure types supported by HealMesh."""
    CRASH_LOOP_BACK_OFF = "CrashLoopBackOff"
    OOM_KILLED = "OOMKilled"
    IMAGE_PULL_BACK_OFF = "ImagePullBackOff"
    FAILED_ROLLOUT = "FailedRollout"
    RESOURCE_QUOTA_EXCEEDED = "ResourceQuotaExceeded"


class DiagnosisConfidence(str, enum.Enum):
    """Confidence level of the LLM diagnosis."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class RemediationActionType(str, enum.Enum):
    """Closed enum of remediation action types."""
    PATCH = "PATCH"
    REDEPLOY = "REDEPLOY"
    SCALE = "SCALE"
    HELM_UPGRADE = "HELM_UPGRADE"
    NONE = "NONE"


class ParsedAction(BaseModel):
    """Parsed remediation action from diagnosis."""
    action_type: RemediationActionType
    params: dict[str, Any] | None = None
    parse_failed: bool = False
    parse_error: str | None = None


class Diagnosis(BaseModel):
    """Diagnosis response from HealMesh AI Engine."""
    diagnosis_id: UUID
    incident_id: UUID
    created_at: datetime
    root_cause: str
    confidence: DiagnosisConfidence
    suggested_manual_command: str | None = None
    parsed_action: ParsedAction
    llm_model: str
    latency_ms: int | None = None


class IncidentSubmitResponse(BaseModel):
    """Response returned when submitting an incident via the SDK."""
    incident_id: UUID
    diagnosis_id: UUID
    status: str
    message: str
    diagnosis: Diagnosis | None = None
