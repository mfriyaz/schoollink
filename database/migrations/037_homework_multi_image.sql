-- Allows a homework post to carry up to 3 images, separate from
-- the existing single attachment_url (which stays for a PDF or
-- a single image, kept for backwards compatibility) and the
-- voice_note_url. Capped at 3 by application logic, not by the
-- database itself.

ALTER TABLE homework
    ADD COLUMN image_urls TEXT[];
