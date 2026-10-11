-- Platform (Super Admin) control: billing ledger, activity trail, notes.

CREATE TABLE IF NOT EXISTS school_payments (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) NOT NULL DEFAULT 'INR',
    paid_on DATE NOT NULL DEFAULT CURRENT_DATE,
    period_start DATE,
    period_end DATE,
    method VARCHAR(30),
    reference VARCHAR(100),
    notes TEXT,
    plan VARCHAR(50),
    recorded_by INTEGER,
    recorded_by_name VARCHAR(150),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_school_payments_school
    ON school_payments (school_id, paid_on DESC);

CREATE TABLE IF NOT EXISTS platform_activity (
    id SERIAL PRIMARY KEY,
    actor_id INTEGER,
    actor_name VARCHAR(150),
    school_id INTEGER,
    school_name VARCHAR(150),
    action VARCHAR(40) NOT NULL,
    summary TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_platform_activity_created
    ON platform_activity (created_at DESC);

ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS internal_notes TEXT;
