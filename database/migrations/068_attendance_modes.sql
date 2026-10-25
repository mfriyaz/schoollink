-- How a school takes attendance: by subject (default), once a day, or morning and afternoon.
BEGIN;

ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS attendance_mode TEXT NOT NULL DEFAULT 'subject';

ALTER TABLE attendance
    ADD COLUMN IF NOT EXISTS session TEXT NOT NULL DEFAULT 'Day';

-- One record per student, date and session (existing rows are all 'Day', so nothing changes for them)
ALTER TABLE attendance DROP CONSTRAINT IF EXISTS uq_attendance_student_date;
ALTER TABLE attendance
    ADD CONSTRAINT uq_attendance_student_date
    UNIQUE (teacher_subject_id, student_id, attendance_date, session);

COMMIT;
