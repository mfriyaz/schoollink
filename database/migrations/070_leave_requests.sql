-- Parents ask for their child's leave; the class teacher or school admin approves or declines.
CREATE TABLE IF NOT EXISTS leave_requests (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    parent_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_date DATE NOT NULL,
    to_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Declined')),
    decided_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    decided_at TIMESTAMP,
    decision_note TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (to_date >= from_date)
);

CREATE INDEX IF NOT EXISTS idx_leave_requests_school_status ON leave_requests (school_id, status, from_date);
CREATE INDEX IF NOT EXISTS idx_leave_requests_student ON leave_requests (student_id, from_date);
