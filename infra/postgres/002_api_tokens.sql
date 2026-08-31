-- HealMesh — Postgres Schema
-- Migration: 002_api_tokens
-- Adds API Token registry and append-only token lifecycle audit logs.

BEGIN;

CREATE TABLE IF NOT EXISTS healmesh.api_tokens (
    token_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_hash      TEXT NOT NULL UNIQUE,
    name            TEXT NOT NULL,
    capabilities    JSONB NOT NULL DEFAULT '["INCIDENT_SUBMIT"]'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at      TIMESTAMPTZ NOT NULL,
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    revoked_at      TIMESTAMPTZ
);

-- Append-only token lifecycle event log
CREATE TABLE IF NOT EXISTS healmesh.api_token_audit_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token_id        UUID,
    event_type      TEXT NOT NULL CHECK (event_type IN ('TOKEN_ISSUED', 'TOKEN_REVOKED', 'TOKEN_AUTH_FAILED')),
    actor           TEXT NOT NULL,
    details         JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enforce append-only triggers on api_token_audit_logs
DO $$
BEGIN
    EXECUTE 'CREATE TRIGGER enforce_append_only_token_audit
             BEFORE UPDATE OR DELETE ON healmesh.api_token_audit_logs
             FOR EACH ROW EXECUTE FUNCTION healmesh.deny_mutation()';
EXCEPTION WHEN duplicate_object THEN
    NULL;
END;
$$;

CREATE INDEX IF NOT EXISTS idx_api_tokens_hash ON healmesh.api_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_api_token_audit_token_id ON healmesh.api_token_audit_logs (token_id, created_at DESC);

COMMIT;
