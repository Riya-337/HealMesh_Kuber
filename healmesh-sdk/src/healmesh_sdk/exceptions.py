"""
healmesh_sdk.exceptions

Exceptions raised by the HealMesh Client SDK.
"""

class HealMeshError(Exception):
    """Base exception for all HealMesh SDK errors."""
    pass


class AuthenticationError(HealMeshError):
    """Raised on HTTP 401 Unauthorized (invalid, expired, or revoked token)."""
    pass


class PermissionDeniedError(HealMeshError):
    """Raised on HTTP 403 Forbidden (token lacks required capabilities)."""
    pass


class RateLimitExceededError(HealMeshError):
    """Raised on HTTP 429 Too Many Requests (per-token or aggregate SDK limit hit)."""
    pass


class ValidationError(HealMeshError):
    """Raised on HTTP 422 Unprocessable Entity (malformed input, denylisted namespace, etc.)."""
    pass


class PayloadTooLargeError(HealMeshError):
    """Raised on HTTP 413 Payload Too Large."""
    pass


class ServerError(HealMeshError):
    """Raised on HTTP 500+ Internal Server Error."""
    pass
