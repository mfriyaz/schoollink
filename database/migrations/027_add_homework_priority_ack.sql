-- Adds Priority and Require Acknowledgement to homework,
-- matching the Create Post mockup - neither existed before.

ALTER TABLE homework
    ADD COLUMN priority VARCHAR(10) DEFAULT 'Normal',
    ADD COLUMN require_acknowledgement BOOLEAN DEFAULT TRUE;
