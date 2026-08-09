CREATE TABLE exam_subjects (
    id SERIAL PRIMARY KEY,

    exam_id INTEGER NOT NULL,

    teacher_subject_id INTEGER NOT NULL,

    max_marks NUMERIC(6,2) NOT NULL,

    pass_marks NUMERIC(6,2) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_exam_subjects_exam
        FOREIGN KEY (exam_id)
        REFERENCES exams(id),

    CONSTRAINT fk_exam_subjects_teacher_subject
        FOREIGN KEY (teacher_subject_id)
        REFERENCES teacher_subjects(id)
);
