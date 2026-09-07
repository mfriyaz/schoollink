-- Same "opt-in showcase" idea as homework submissions, applied
-- to Good Morning messages: lets a class teacher allow parents
-- to see every classmate's Good Morning voice message and the
-- teacher's reaction to it, instead of only their own child's.
-- Lives on teacher_subjects since that's what already
-- identifies a class teacher's specific class/section. Off by
-- default - a teacher has to deliberately turn it on.

ALTER TABLE teacher_subjects
    ADD COLUMN IF NOT EXISTS allow_shared_greetings BOOLEAN DEFAULT false;
