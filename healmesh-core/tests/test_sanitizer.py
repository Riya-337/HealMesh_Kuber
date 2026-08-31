"""
healmesh-core/tests/test_sanitizer.py

Unit tests for secret scrubbing and credential redaction.
"""
from auth.sanitizer import sanitize_text, sanitize_log_lines


def test_sanitize_bearer_token():
    raw = "Authorization: Bearer abcdef1234567890abcdef1234567890"
    scrubbed = sanitize_text(raw)
    assert "[REDACTED_TOKEN]" in scrubbed
    assert "abcdef1234567890" not in scrubbed


def test_sanitize_jwt():
    raw = "Session header eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.doNotLeakThisSignature123 expired"
    scrubbed = sanitize_text(raw)
    assert "[REDACTED_JWT]" in scrubbed
    assert "doNotLeakThisSignature" not in scrubbed


def test_sanitize_aws_key():
    raw = "AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE and aws_secret_access_key=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
    scrubbed = sanitize_text(raw)
    assert "[REDACTED_AWS_KEY]" in scrubbed
    assert "[REDACTED_SECRET]" in scrubbed


def test_sanitize_passwords_and_secrets():
    raw = 'Failed connection with password="SuperSecretPassword123!" and api_key=\'sk_live_123456789\''
    scrubbed = sanitize_text(raw)
    assert "SuperSecretPassword123" not in scrubbed
    assert "sk_live_123456789" not in scrubbed


def test_sanitize_private_key():
    raw = """
    Connecting to SSH:
    -----BEGIN RSA PRIVATE KEY-----
    MIIEowIBAAKCAQEA0Y1+
    FakeKeyMaterialHere
    -----END RSA PRIVATE KEY-----
    Connection failed.
    """
    scrubbed = sanitize_text(raw)
    assert "[REDACTED_PRIVATE_KEY]" in scrubbed
    assert "FakeKeyMaterialHere" not in scrubbed


def test_sanitize_log_lines_array():
    lines = [
        "INFO 2026-08-22 starting worker",
        "ERROR connecting with token=secret12345678",
        "FATAL database timeout",
    ]
    scrubbed = sanitize_log_lines(lines)
    assert len(scrubbed) == 3
    assert "[REDACTED]" in scrubbed[1]
    assert "secret12345678" not in scrubbed[1]


def test_sanitize_edge_cases():
    assert sanitize_text("") == ""
    assert sanitize_text(None) is None
    assert sanitize_log_lines([]) == []
