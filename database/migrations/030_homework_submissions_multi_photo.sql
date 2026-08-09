-- Changes homework_submissions from one photo per submission
-- to up to 5, stored as an array. A parent can submit several
-- photos of their child's work (e.g. multiple pages) instead
-- of being limited to one.

ALTER TABLE homework_submissions
    ADD COLUMN photo_urls TEXT[];

-- Carry over any existing single-photo submissions into the
-- new array column before dropping the old one.
UPDATE homework_submissions
    SET photo_urls = ARRAY[photo_url]
    WHERE photo_url IS NOT NULL;

ALTER TABLE homework_submissions
    ALTER COLUMN photo_urls SET NOT NULL,
    DROP COLUMN photo_url;
