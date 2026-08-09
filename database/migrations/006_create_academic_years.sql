CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    year_name VARCHAR(20) NOT NULL,

    start_date DATE NOT NULL,

    end_date DATE NOT NULL,

    is_current BOOLEAN DEFAULT FALSE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_academic_years_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
);
