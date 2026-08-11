-- The Assign Teacher feature had no duplicate check when it
-- first shipped, so testing it created real duplicate rows in
-- teacher_subjects. Three other tables (homework, attendance,
-- exam_subjects) can each reference a specific teacher_subjects
-- row, so a duplicate can't just be deleted outright if
-- something already points at it - those references need to be
-- redirected to the row being kept first.
--
-- For each group of duplicates (same teacher/subject/class/
-- section/academic_year), the lowest id is kept as the
-- "survivor" and everything else in the group is merged into it.
--
-- Wrapped in an explicit transaction so this is all-or-nothing -
-- if anything fails partway, nothing is left half-migrated.

BEGIN;

CREATE TEMP TABLE teacher_subjects_dedup_map AS
SELECT
    ts.id AS old_id,
    MIN(ts.id) OVER (
        PARTITION BY ts.teacher_id, ts.subject_id, ts.class_id, ts.section_id, ts.academic_year_id
    ) AS keeper_id
FROM teacher_subjects ts;

UPDATE homework h
SET teacher_subject_id = m.keeper_id
FROM teacher_subjects_dedup_map m
WHERE h.teacher_subject_id = m.old_id
AND m.old_id != m.keeper_id;

UPDATE attendance a
SET teacher_subject_id = m.keeper_id
FROM teacher_subjects_dedup_map m
WHERE a.teacher_subject_id = m.old_id
AND m.old_id != m.keeper_id;

UPDATE exam_subjects e
SET teacher_subject_id = m.keeper_id
FROM teacher_subjects_dedup_map m
WHERE e.teacher_subject_id = m.old_id
AND m.old_id != m.keeper_id;

DELETE FROM teacher_subjects ts
USING teacher_subjects_dedup_map m
WHERE ts.id = m.old_id
AND m.old_id != m.keeper_id;

DROP TABLE teacher_subjects_dedup_map;

ALTER TABLE teacher_subjects
    ADD CONSTRAINT uq_teacher_subjects_assignment
    UNIQUE (teacher_id, subject_id, class_id, section_id, academic_year_id);

COMMIT;
