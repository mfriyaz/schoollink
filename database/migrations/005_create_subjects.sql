CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    subject_name VARCHAR(100) NOT NULL,

    subject_code VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_subject_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
);