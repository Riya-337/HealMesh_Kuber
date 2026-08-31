"""
healmesh-core/auth/sanitizer.py

Log tail sanitization and automated credential redaction.
Scans incoming text lines for common secret patterns (JWTs, private keys,
bearer tokens, AWS/GCP access keys, password assignments) and redacts them
before prompt assembly or database persistence.
"""
from __future__ import annotations
import re

# Regex patterns matching common secret/credential signatures
_PATTERNS = [
    # Private Key blocks
    (re.compile(r"-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----.*?-----END \1PRIVATE KEY-----", re.DOTALL), "[REDACTED_PRIVATE_KEY]"),
    # Bearer tokens
    (re.compile(r"(?i)\b(bearer\s+)[a-zA-Z0-9\-_]{20,}\b"), r"\1[REDACTED_TOKEN]"),
    # JWTs
    (re.compile(r"\beyJ[a-zA-Z0-9\-_]{10,}\.[a-zA-Z0-9\-_]{10,}\.[a-zA-Z0-9\-_]{10,}\b"), "[REDACTED_JWT]"),
    # AWS Access Keys & Secret Keys
    (re.compile(r"\b(AKIA|ABIA|ACCA|ASIA)[A-Z0-9]{16}\b"), "[REDACTED_AWS_KEY]"),
    (re.compile(r"(?i)(aws_secret_access_key\s*[:=]\s*)[^\s]{20,}"), r"\1[REDACTED_SECRET]"),
    # Generic Passwords & Secrets in env / logs
    (re.compile(r"(?i)(password|passwd|secret|api_key|token)\s*[:=]\s*['\"]?[^\s'\",]{6,}['\"]?"), r"\1=[REDACTED]"),
]


def sanitize_text(text: str) -> str:
    """Scrub sensitive credentials from a string."""
    if not text:
        return text
    sanitized = text
    for pattern, replacement in _PATTERNS:
        sanitized = pattern.sub(replacement, sanitized)
    return sanitized


def sanitize_log_lines(lines: list[str]) -> list[str]:
    """Scrub sensitive credentials from an array of log lines."""
    if not lines:
        return []
    return [sanitize_text(line) for line in lines]
