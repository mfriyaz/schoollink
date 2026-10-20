-- People whose password was set or reset by someone else must choose their own at next login.
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
