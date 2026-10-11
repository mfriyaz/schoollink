-- Cached AI weekly summaries for parents (one per child, day and language)
CREATE TABLE IF NOT EXISTS weekly_summaries (
    id          SERIAL PRIMARY KEY,
    school_id   INTEGER NOT NULL,
    student_id  INTEGER NOT NULL,
    as_of       DATE NOT NULL,
    language    VARCHAR(8) NOT NULL DEFAULT 'en',
    summary     TEXT NOT NULL,
    facts_hash  TEXT NOT NULL,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE (student_id, as_of, language)
);
