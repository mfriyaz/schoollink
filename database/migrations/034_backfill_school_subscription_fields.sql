-- These columns (subscription_plan, status, subscription_expiry)
-- existed on the original local development database from very
-- early in this project, added directly rather than through a
-- tracked migration file. They were only discovered missing when
-- a fresh production database (this deployment) hit a "column
-- does not exist" error trying to onboard a school. This
-- migration backfills that gap so any future fresh database
-- (a new deployment, a teammate's local setup, etc.) includes
-- them from the start rather than hitting the same error.
--
-- Uses IF NOT EXISTS so this is safe to run even on a database
-- (like your original local one) where these columns already
-- exist from before this migration was written.

ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'STANDARD',
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
    ADD COLUMN IF NOT EXISTS subscription_expiry DATE;
