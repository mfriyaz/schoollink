-- Quiz question types: 'mcq' (4 options), 'tf' (True/False), 'fill' (type the answer).
-- For 'fill', accepted_answers holds the answers the teacher will accept.
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS qtype VARCHAR(10) NOT NULL DEFAULT 'mcq';
ALTER TABLE quiz_questions ADD COLUMN IF NOT EXISTS accepted_answers JSONB;
