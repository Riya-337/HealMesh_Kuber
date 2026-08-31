"""
healmesh_sdk

Official Python SDK for HealMesh — Autonomous Kubernetes AI Diagnosis.
"""
from healmesh_sdk.client import AsyncHealMeshClient, HealMeshClient
from healmesh_sdk.exceptions import (
    AuthenticationError,
    HealMeshError,
    PayloadTooLargeError,
    PermissionDeniedError,
    RateLimitExceededError,
    ServerError,
    ValidationError,
)
from healmesh_sdk.models import (
    Diagnosis,
    DiagnosisConfidence,
    FailureType,
    IncidentSubmitResponse,
    ParsedAction,
    RemediationActionType,
)

__version__ = "0.1.0"
__all__ = [
    "HealMeshClient",
    "AsyncHealMeshClient",
    "HealMeshError",
    "AuthenticationError",
    "PermissionDeniedError",
    "PayloadTooLargeError",
    "ValidationError",
    "RateLimitExceededError",
    "ServerError",
    "FailureType",
    "DiagnosisConfidence",
    "RemediationActionType",
    "ParsedAction",
    "Diagnosis",
    "IncidentSubmitResponse",
]
