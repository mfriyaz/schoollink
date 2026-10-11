-- Per-school storage tracking: one row per uploaded file.
CREATE TABLE IF NOT EXISTS uploaded_files (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    user_id INTEGER,
    url TEXT NOT NULL UNIQUE,
    filename TEXT,
    kind VARCHAR(12) NOT NULL DEFAULT 'other',   -- image | audio | document | other
    mimetype VARCHAR(100),
    bytes BIGINT NOT NULL DEFAULT 0,
    source VARCHAR(10) NOT NULL DEFAULT 'upload', -- upload | backfill
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_uploaded_files_school
    ON uploaded_files (school_id, created_at DESC);

-- Optional storage cap per school (in MB). NULL = no limit.
ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS max_storage_mb INTEGER;
