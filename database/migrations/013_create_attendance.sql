CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,

    teacher_subject_id INTEGER NOT NULL,

    student_id INTEGER NOT NULL,

    attendance_date DATE NOT NULL,

    status VARCHAR(20) NOT NULL,

    remarks TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_attendance_teacher_subject
        FOREIGN KEY (teacher_subject_id)
        REFERENCES teacher_subjects(id),

    CONSTRAINT fk_attendance_student
        FOREIGN KEY (student_id)
        REFERENCES students(id),

    CONSTRAINT uq_attendance_student_date
        UNIQUE (teacher_subject_id, student_id, attendance_date)
);
