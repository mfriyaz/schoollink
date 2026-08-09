CREATE TABLE homework (
    id SERIAL PRIMARY KEY,

    teacher_subject_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    homework_date DATE NOT NULL,

    due_date DATE NOT NULL,

    attachment_url TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_homework_teacher_subject
        FOREIGN KEY (teacher_subject_id)
        REFERENCES teacher_subjects(id)
);
