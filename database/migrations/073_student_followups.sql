-- Follow-up notes on students who need attention ("Called father, child was ill").
-- signature remembers which problems were flagged at the time, so the student stays hidden
-- from the "needs attention" list only until a different problem appears (or 14 days pass).
CREATE TABLE IF NOT EXISTS student_followups (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    note TEXT NOT NULL,
    signature TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_followups_student ON student_followups (student_id, created_at DESC);
