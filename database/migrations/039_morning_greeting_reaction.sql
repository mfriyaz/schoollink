-- Lets a teacher react to a parent's Good Morning voice
-- message (e.g. thumbs up, great, nice) so the parent knows
-- it was actually received and appreciated, not just sitting
-- there silently.

ALTER TABLE morning_greetings
    ADD COLUMN IF NOT EXISTS teacher_reaction VARCHAR(20);
