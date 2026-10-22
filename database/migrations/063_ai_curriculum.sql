-- The school's curriculum / board (set by Super Admin), used by AI features
-- such as the homework generator. Empty means "general school curriculum".
ALTER TABLE schools ADD COLUMN IF NOT EXISTS ai_curriculum VARCHAR(80);
