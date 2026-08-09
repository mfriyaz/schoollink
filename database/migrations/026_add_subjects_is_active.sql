-- Adds soft-delete support to subjects, matching the pattern
-- used for teachers/students/classes/sections - a subject with
-- teacher_subjects tied to it can't be safely hard-deleted
-- without orphaning that data or hitting a foreign key error.

ALTER TABLE subjects
    ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
