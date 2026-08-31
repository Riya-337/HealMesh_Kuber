"""
healmesh_sdk.client

Client classes for communicating with HealMesh Core service.
Supports synchronous and asynchronous HTTP interfaces via httpx.
"""
from __future__ import annotations

from typing import Any, Optional, Sequence
import httpx

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
    FailureType,
    IncidentSubmitResponse,
)


def _handle_response_error(response: httpx.Response) -> None:
    """Map HTTP error status codes to typed SDK exceptions."""
    if response.is_success:
        return

    status = response.status_code
    detail = response.text
    try:
        data = response.json()
        detail = data.get("detail", detail)
    except Exception:
        pass

    if status == 401:
        raise AuthenticationError(f"Authentication failed (401): {detail}")
    elif status == 403:
        raise PermissionDeniedError(f"Permission denied (403): {detail}")
    elif status == 413:
        raise PayloadTooLargeError(f"Payload too large (413): {detail}")
    elif status == 422:
        raise ValidationError(f"Validation error (422): {detail}")
    elif status == 429:
        raise RateLimitExceededError(f"Rate limit exceeded (429): {detail}")
    elif status >= 500:
        raise ServerError(f"Server error ({status}): {detail}")
    else:
        raise HealMeshError(f"HTTP request failed with status {status}: {detail}")


class HealMeshClient:
    """Synchronous client for HealMesh API."""

    def __init__(
        self,
        api_token: str,
        base_url: str = "https://api.healmesh.local",
        timeout: float = 30.0,
        verify_ssl: bool = True,
        transport: Optional[httpx.BaseTransport] = None,
    ):
        self.api_token = api_token
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.verify_ssl = verify_ssl
        self.transport = transport

        self._headers = {
            "Authorization": f"Bearer {self.api_token}",
            "User-Agent": "healmesh-sdk-python/0.1.0",
            "Content-Type": "application/json",
        }

    def diagnose_incident(
        self,
        namespace: str,
        pod_name: str,
        failure_type: FailureType | str,
        log_lines: Optional[Sequence[str]] = None,
        container_name: Optional[str] = None,
        image: Optional[str] = None,
        extra_context: Optional[dict[str, str]] = None,
    ) -> IncidentSubmitResponse:
        """
        Submit incident telemetry to HealMesh and receive an AI root-cause diagnosis.
        (Diagnosis-only operation).
        """
        f_type_str = failure_type.value if isinstance(failure_type, FailureType) else str(failure_type)
        payload: dict[str, Any] = {
            "namespace": namespace,
            "pod_name": pod_name,
            "failure_type": f_type_str,
            "log_lines": list(log_lines or []),
        }
        if container_name:
            payload["container_name"] = container_name
        if image:
            payload["image"] = image
        if extra_context:
            payload["extra_context"] = extra_context

        endpoint = f"{self.base_url}/api/v1/sdk/incident"
        with httpx.Client(timeout=self.timeout, verify=self.verify_ssl, transport=self.transport) as client:
            resp = client.post(endpoint, headers=self._headers, json=payload)
            _handle_response_error(resp)
            return IncidentSubmitResponse(**resp.json())


class AsyncHealMeshClient:
    """Asynchronous client for HealMesh API."""

    def __init__(
        self,
        api_token: str,
        base_url: str = "https://api.healmesh.local",
        timeout: float = 30.0,
        verify_ssl: bool = True,
        transport: Optional[httpx.AsyncBaseTransport] = None,
    ):
        self.api_token = api_token
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self.verify_ssl = verify_ssl
        self.transport = transport

        self._headers = {
            "Authorization": f"Bearer {self.api_token}",
            "User-Agent": "healmesh-sdk-python/0.1.0",
            "Content-Type": "application/json",
        }

    async def diagnose_incident(
        self,
        namespace: str,
        pod_name: str,
        failure_type: FailureType | str,
        log_lines: Optional[Sequence[str]] = None,
        container_name: Optional[str] = None,
        image: Optional[str] = None,
        extra_context: Optional[dict[str, str]] = None,
    ) -> IncidentSubmitResponse:
        """
        Asynchronously submit incident telemetry and receive an AI root-cause diagnosis.
        (Diagnosis-only operation).
        """
        f_type_str = failure_type.value if isinstance(failure_type, FailureType) else str(failure_type)
        payload: dict[str, Any] = {
            "namespace": namespace,
            "pod_name": pod_name,
            "failure_type": f_type_str,
            "log_lines": list(log_lines or []),
        }
        if container_name:
            payload["container_name"] = container_name
        if image:
            payload["image"] = image
        if extra_context:
            payload["extra_context"] = extra_context

        endpoint = f"{self.base_url}/api/v1/sdk/incident"
        async with httpx.AsyncClient(timeout=self.timeout, verify=self.verify_ssl, transport=self.transport) as client:
            resp = await client.post(endpoint, headers=self._headers, json=payload)
            _handle_response_error(resp)
            return IncidentSubmitResponse(**resp.json())
