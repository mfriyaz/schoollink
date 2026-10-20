-- "End assignment": a teacher can stop teaching a subject/class/section
-- without deleting the row, so attendance, homework and marks keep their history.
-- An ended assignment is hidden from the teacher and from new work.

ALTER TABLE teacher_subjects
    ADD COLUMN IF NOT EXISTS ended_at TIMESTAMP NULL;

-- The same teacher may be given the same subject/class/section again
-- after an earlier assignment was ended, so uniqueness only applies to live rows.
ALTER TABLE teacher_subjects
    DROP CONSTRAINT IF EXISTS uq_teacher_subjects_assignment;

CREATE UNIQUE INDEX IF NOT EXISTS uq_teacher_subjects_assignment_live
    ON teacher_subjects (teacher_id, subject_id, class_id, section_id, academic_year_id)
    WHERE ended_at IS NULL;
