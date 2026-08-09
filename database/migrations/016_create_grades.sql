CREATE TABLE grades (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    grade_name VARCHAR(10) NOT NULL,

    minimum_percentage NUMERIC(5,2) NOT NULL,

    maximum_percentage NUMERIC(5,2) NOT NULL,

    grade_point NUMERIC(3,2),

    result VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_grades_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
);
