-- School-chosen attendance warning level for the Early Warning screen (default 85)
ALTER TABLE schools ADD COLUMN IF NOT EXISTS warn_attendance_pct INTEGER NOT NULL DEFAULT 85;
