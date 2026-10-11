-- Teacher / admin remarks shown on a student's report card (one per student per exam)
CREATE TABLE IF NOT EXISTS report_card_remarks (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    exam_id INTEGER NOT NULL,
    remarks TEXT NOT NULL,
    updated_by INTEGER,
    ai_assisted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_report_remarks_student_exam UNIQUE (student_id, exam_id)
);

CREATE INDEX IF NOT EXISTS idx_report_remarks_school ON report_card_remarks (school_id);
