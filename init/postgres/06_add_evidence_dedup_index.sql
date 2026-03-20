\connect wovo_ai

-- =============================================================================
-- Migration 06: Add evidence dedup index + missing table DDL
-- Safe to run multiple times (fully idempotent).
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. demo_users — lightweight user identities for audit trail / UI
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS demo_users (
    id           VARCHAR(50)  PRIMARY KEY,
    name         VARCHAR(255) NOT NULL,
    role         VARCHAR(100) NOT NULL,
    avatar_color VARCHAR(30)  NOT NULL
);

-- ---------------------------------------------------------------------------
-- 2. remediation_audit_log — every change to a remediation plan
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS remediation_audit_log (
    id               SERIAL      PRIMARY KEY,
    remediation_id   INTEGER     NOT NULL REFERENCES remediation_plans(id),
    action           VARCHAR(50) NOT NULL,
    -- status_change, field_edit, evidence_added, evidence_auto_attached
    field            VARCHAR(100),
    previous_value   TEXT,
    new_value        TEXT,
    actor_id         VARCHAR(100) NOT NULL DEFAULT 'system',
    actor_type       VARCHAR(30)  NOT NULL,
    -- user, system, auto_evidence_job
    created_at       TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_remediation
    ON remediation_audit_log(remediation_id);

-- ---------------------------------------------------------------------------
-- 3. idx_evidence_dedup — unique index on remediation_evidence
--    Prevents duplicate (remediation_id, reference_id) pairs.
-- ---------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS idx_evidence_dedup
    ON remediation_evidence(remediation_id, reference_id);
