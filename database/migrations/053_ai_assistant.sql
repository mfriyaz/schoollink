-- AI writing assistant: per-school switch, monthly limit and usage log
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ai_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ai_monthly_limit INTEGER NOT NULL DEFAULT 300;

CREATE TABLE IF NOT EXISTS ai_usage (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    user_id INTEGER,
    feature VARCHAR(40) NOT NULL,
    model VARCHAR(80),
    input_tokens INTEGER NOT NULL DEFAULT 0,
    output_tokens INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_usage_school_month ON ai_usage (school_id, created_at);
