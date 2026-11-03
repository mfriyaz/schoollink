-- How many days back a teacher may mark or change attendance. NULL = no limit (the old behaviour).
ALTER TABLE schools ADD COLUMN IF NOT EXISTS attendance_edit_days INTEGER
    CHECK (attendance_edit_days IS NULL OR (attendance_edit_days >= 0 AND attendance_edit_days <= 60));
