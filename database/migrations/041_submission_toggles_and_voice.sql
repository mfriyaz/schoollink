-- Lets a teacher control, per homework post, whether students
-- can submit a photo of their work, a voice recording (for
-- reading homework), or both. Photo submission already existed
-- unconditionally before this - defaulting it to true preserves
-- that behaviour for every existing post. Voice submission is
-- brand new, so it defaults to off until a teacher explicitly
-- turns it on for a specific post.

ALTER TABLE homework
    ADD COLUMN IF NOT EXISTS allow_photo_submission BOOLEAN DEFAULT true;

ALTER TABLE homework
    ADD COLUMN IF NOT EXISTS allow_voice_submission BOOLEAN DEFAULT false;

ALTER TABLE homework_submissions
    ADD COLUMN IF NOT EXISTS voice_url TEXT;
