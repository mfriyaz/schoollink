-- Every change to a school's plan / status / expiry / limits, with who and why.
CREATE TABLE IF NOT EXISTS school_subscription_history (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    changed_by INTEGER,
    changed_by_name VARCHAR(150),
    source VARCHAR(20) NOT NULL DEFAULT 'manual',  -- manual | payment | status
    changes JSONB NOT NULL,                        -- { field: { from, to } }
    reason TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sub_history_school
    ON school_subscription_history (school_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_sub_history_created
    ON school_subscription_history (created_at DESC);
