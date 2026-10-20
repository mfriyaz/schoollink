-- Exams can be archived (hidden) instead of deleted once marks exist.
-- Archived = is_active false. Marks and report cards stay untouched.
ALTER TABLE exams
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
