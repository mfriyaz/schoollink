-- Lets an announcement carry up to 3 images (e.g. a competition
-- award photo). Same approach as homework.image_urls.
-- Safe to run more than once.

ALTER TABLE announcements
    ADD COLUMN IF NOT EXISTS image_urls TEXT[];
