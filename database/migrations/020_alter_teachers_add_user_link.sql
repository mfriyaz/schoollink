-- Links a teacher's HR record (teachers table) to their login
-- account (users table), so a logged-in Teacher's JWT can be
-- resolved to a teacher_id. This link did not exist before --
-- createTeacher() never created or linked a user account.
-- Nullable because not every teacher record needs a login yet.

ALTER TABLE teachers
    ADD COLUMN user_id INTEGER,
    ADD CONSTRAINT fk_teachers_user
        FOREIGN KEY (user_id)
        REFERENCES users(id),
    ADD CONSTRAINT uq_teachers_user_id
        UNIQUE (user_id);
