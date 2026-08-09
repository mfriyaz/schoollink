CREATE TABLE student_marks (
    id SERIAL PRIMARY KEY,

    exam_subject_id INTEGER NOT NULL,

    student_id INTEGER NOT NULL,

    marks_obtained NUMERIC(6,2) NOT NULL,

    percentage NUMERIC(5,2),

    grade_name VARCHAR(10),

    grade_point NUMERIC(3,2),

    result VARCHAR(20),

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_marks_exam_subject
        FOREIGN KEY (exam_subject_id)
        REFERENCES exam_subjects(id),

    CONSTRAINT fk_student_marks_student
        FOREIGN KEY (student_id)
        REFERENCES students(id),

    CONSTRAINT uq_student_marks_unique
        UNIQUE (exam_subject_id, student_id)
);
