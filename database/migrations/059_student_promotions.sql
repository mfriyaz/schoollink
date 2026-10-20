-- History of year-end moves: who moved from which class to which, and when.
CREATE TABLE IF NOT EXISTS student_promotions (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    student_id INTEGER NOT NULL REFERENCES students(id),
    from_year_id INTEGER REFERENCES academic_years(id),
    to_year_id INTEGER REFERENCES academic_years(id),
    from_class_id INTEGER,
    from_section_id INTEGER,
    to_class_id INTEGER,
    to_section_id INTEGER,
    action VARCHAR(10) NOT NULL CHECK (action IN ('promote', 'stay', 'leave')),
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_promotions_student ON student_promotions (student_id);
CREATE INDEX IF NOT EXISTS idx_student_promotions_school_year ON student_promotions (school_id, to_year_id);
