-- Each school can choose its colour theme (set by the School Admin in Settings).
-- Everyone in that school (teachers, parents) then sees the same theme.
ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS theme VARCHAR(30) NOT NULL DEFAULT 'sunshine';
