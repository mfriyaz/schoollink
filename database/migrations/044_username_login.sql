-- Adds an optional username as a second way to log in, alongside
-- email. Nullable (existing accounts won't have one until set),
-- but UNIQUE platform-wide when set - not just within a school -
-- so login can always find exactly one match without needing to
-- know which school someone belongs to first. Postgres allows
-- multiple NULLs under a UNIQUE constraint, so this doesn't
-- force every existing account to get one immediately.

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE;
