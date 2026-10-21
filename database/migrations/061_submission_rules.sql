-- Homework submission rules:
--  * a closing date (default: due date + 3 days) after which parents can no longer submit
--  * a teacher "close early" switch
--  * late flag, re-submission counter and a lock once the teacher has reviewed
-- Old homework keeps working exactly as before: no closing date = stays open.

ALTER TABLE homework
    ADD COLUMN IF NOT EXISTS submissions_close_date DATE;

ALTER TABLE homework
    ADD COLUMN IF NOT EXISTS submissions_closed BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE homework_submissions
    ADD COLUMN IF NOT EXISTS is_late BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE homework_submissions
    ADD COLUMN IF NOT EXISTS resubmit_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE homework_submissions
    ADD COLUMN IF NOT EXISTS locked BOOLEAN NOT NULL DEFAULT false;
