-- The Assign Teacher feature had no duplicate check when it
-- first shipped, so testing it created real duplicate rows
-- (same teacher assigned to the same subject/class/section
-- more than once). This cleans those up, keeping only the
-- earliest row per unique combination, then adds a real
-- database-level constraint so this can never happen again -
-- even from a double-click or a race condition, not just
-- through the application-level check added alongside this.

DELETE FROM teacher_subjects a
USING teacher_subjects b
WHERE a.id > b.id
AND a.teacher_id = b.teacher_id
AND a.subject_id = b.subject_id
AND a.class_id = b.class_id
AND a.section_id = b.section_id
AND a.academic_year_id = b.academic_year_id;

ALTER TABLE teacher_subjects
    ADD CONSTRAINT uq_teacher_subjects_assignment
    UNIQUE (teacher_id, subject_id, class_id, section_id, academic_year_id);
