CREATE TABLE exams (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    academic_year_id INTEGER NOT NULL,

    exam_name VARCHAR(150) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_exams_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id),

    CONSTRAINT fk_exams_academic_year
        FOREIGN KEY (academic_year_id)
        REFERENCES academic_years(id)
);
