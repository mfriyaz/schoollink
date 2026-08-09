-- Lets a parent submit a photo of their child's completed
-- homework, tied to a specific homework post. One submission
-- per (homework, student) pair - resubmitting replaces the
-- previous photo rather than creating a duplicate row.

CREATE TABLE homework_submissions (
    id SERIAL PRIMARY KEY,

    homework_id INTEGER NOT NULL,

    student_id INTEGER NOT NULL,

    parent_user_id INTEGER NOT NULL,

    photo_url TEXT NOT NULL,

    remarks TEXT,

    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_homework_submissions_homework
        FOREIGN KEY (homework_id)
        REFERENCES homework(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_homework_submissions_student
        FOREIGN KEY (student_id)
        REFERENCES students(id),

    CONSTRAINT fk_homework_submissions_parent
        FOREIGN KEY (parent_user_id)
        REFERENCES users(id),

    CONSTRAINT uq_homework_submissions_pair
        UNIQUE (homework_id, student_id)
);
