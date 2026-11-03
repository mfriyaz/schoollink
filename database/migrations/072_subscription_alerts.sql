-- Remembers which subscription warnings were already sent, so each is sent once per expiry date.
CREATE TABLE IF NOT EXISTS subscription_alerts (
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    kind TEXT NOT NULL CHECK (kind IN ('before', 'expired', 'final', 'locked')),
    expiry_date DATE NOT NULL,
    sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (school_id, kind, expiry_date)
);
