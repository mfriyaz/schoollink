-- Notifications currently accumulate forever with no concept
-- of expiry. This adds a default 30-day expiry so the main
-- notification feed/bell stays relevant, while a separate
-- "Expired" view (built alongside this) still lets someone
-- look back further if they need to.

ALTER TABLE notifications
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP
    DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days');

-- Backfill existing rows that predate this column, so they
-- don't all appear as "already expired" (or all show as
-- "never expires") the moment this runs.
UPDATE notifications
SET expires_at = created_at + INTERVAL '30 days'
WHERE expires_at IS NULL;
