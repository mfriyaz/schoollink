CREATE TABLE classes (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    class_name VARCHAR(50) NOT NULL,

    section VARCHAR(10),

    academic_year VARCHAR(20) NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_classes_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
);