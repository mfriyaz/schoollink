-- The attendance table only ever had created_at - this adds
-- updated_at so re-saving/correcting attendance for a date can
-- be tracked separately from when it was first recorded, used
-- as a visible timestamp "proof" in the Take Attendance screen.

ALTER TABLE attendance
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
