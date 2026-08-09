-- Links a parent's login account (users table, Parent role)
-- to the student(s) they are the guardian of.
-- Needed so a logged-in parent can see their own children's
-- homework/announcements, matching the Parent Dashboard mockup.

CREATE TABLE parent_students (
    id SERIAL PRIMARY KEY,

    parent_user_id INTEGER NOT NULL,

    student_id INTEGER NOT NULL,

    relationship VARCHAR(30) DEFAULT 'Parent',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_parent_students_user
        FOREIGN KEY (parent_user_id)
        REFERENCES users(id),

    CONSTRAINT fk_parent_students_student
        FOREIGN KEY (student_id)
        REFERENCES students(id),

    CONSTRAINT uq_parent_students_pair
        UNIQUE (parent_user_id, student_id)
);
