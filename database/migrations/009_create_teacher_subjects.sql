CREATE TABLE teacher_subjects (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    academic_year_id INTEGER NOT NULL,

    teacher_id INTEGER NOT NULL,

    subject_id INTEGER NOT NULL,

    class_id INTEGER NOT NULL,

    section_id INTEGER NOT NULL,

    is_class_teacher BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_teacher_subjects_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id),

    CONSTRAINT fk_teacher_subjects_academic_year
        FOREIGN KEY (academic_year_id)
        REFERENCES academic_years(id),

    CONSTRAINT fk_teacher_subjects_teacher
        FOREIGN KEY (teacher_id)
        REFERENCES teachers(id),

    CONSTRAINT fk_teacher_subjects_subject
        FOREIGN KEY (subject_id)
        REFERENCES subjects(id),

    CONSTRAINT fk_teacher_subjects_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id),

    CONSTRAINT fk_teacher_subjects_section
        FOREIGN KEY (section_id)
        REFERENCES sections(id)
);
