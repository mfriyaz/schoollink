-- Lets a teacher opt a specific post into "showcase" mode -
-- where parents can see every student's submitted photo/voice
-- work for that post, similar to how everyone naturally sees
-- everyone's shared photos in a WhatsApp group. Off by default
-- for every post - a teacher has to deliberately turn this on,
-- and it only applies to that one post, not every post going
-- forward.

ALTER TABLE homework
    ADD COLUMN IF NOT EXISTS allow_view_all_submissions BOOLEAN DEFAULT false;
