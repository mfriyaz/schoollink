-- Teacher-only answer keys for homework (for example from the AI homework generator).
-- Kept in their own table so no query that loads a homework for a parent can ever return them.

CREATE TABLE IF NOT EXISTS homework_answer_keys (
    homework_id INTEGER PRIMARY KEY,
    answer_key TEXT NOT NULL,
    ai_generated BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_homework_answer_keys_homework
        FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE
);
