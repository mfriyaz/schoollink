-- Teacher can close a quiz (no new tries) without deleting the results.
ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS closed BOOLEAN NOT NULL DEFAULT false;
