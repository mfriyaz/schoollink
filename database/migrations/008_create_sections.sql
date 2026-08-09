CREATE TABLE sections (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    class_id INTEGER NOT NULL,

    section_name VARCHAR(10) NOT NULL,

    class_teacher_id INTEGER,

    capacity INTEGER DEFAULT 40,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_sections_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id),

    CONSTRAINT fk_sections_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id),

    CONSTRAINT fk_sections_class_teacher
        FOREIGN KEY (class_teacher_id)
        REFERENCES teachers(id)
);
