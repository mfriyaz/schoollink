-- Lets a parent add a short text remark when acknowledging a
-- post, and lets a teacher react to (and mark reviewed) a
-- homework photo submission.

ALTER TABLE acknowledgements
    ADD COLUMN remarks TEXT;

ALTER TABLE homework_submissions
    ADD COLUMN reaction VARCHAR(20),
    ADD COLUMN reviewed_at TIMESTAMP,
    ADD COLUMN reviewed_by INTEGER;

ALTER TABLE homework_submissions
    ADD CONSTRAINT chk_homework_submissions_reaction
        CHECK (reaction IN ('thumbs_up', 'heart', 'star') OR reaction IS NULL),

    ADD CONSTRAINT fk_homework_submissions_reviewed_by
        FOREIGN KEY (reviewed_by)
        REFERENCES users(id);
