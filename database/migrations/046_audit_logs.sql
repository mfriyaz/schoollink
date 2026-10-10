-- Activity log: who created / edited / deleted what, and when.
-- Append-only: UPDATE and DELETE on this table are blocked by a trigger.

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    user_id INTEGER,
    user_name VARCHAR(150),
    user_role VARCHAR(50),
    action VARCHAR(20) NOT NULL,
    entity_type VARCHAR(30) NOT NULL,
    entity_id INTEGER,
    entity_title TEXT,
    summary TEXT,
    changes JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_school_created
    ON audit_logs (school_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_entity
    ON audit_logs (entity_type, entity_id);

CREATE OR REPLACE FUNCTION audit_logs_block_changes() RETURNS trigger AS $$
BEGIN
    RAISE EXCEPTION 'audit_logs is append-only';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_audit_logs_no_update ON audit_logs;

CREATE TRIGGER trg_audit_logs_no_update
    BEFORE UPDATE OR DELETE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION audit_logs_block_changes();
