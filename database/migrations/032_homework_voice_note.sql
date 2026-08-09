-- Adds an optional voice note to homework posts, separate from
-- the existing attachment_url (PDF/image) - a teacher can record
-- a short spoken message alongside or instead of typing.

ALTER TABLE homework
    ADD COLUMN voice_note_url TEXT;
