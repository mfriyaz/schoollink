-- Super Admin can switch each AI feature on or off per school.
-- A feature that is not listed counts as ON, so existing schools keep everything.
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ai_features JSONB NOT NULL DEFAULT '{}'::jsonb;
