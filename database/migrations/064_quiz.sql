-- Practice quiz (multiple choice) attached to a homework.
-- Its own tables: nothing here is joined into the normal homework queries,
-- so the correct answers can never reach a parent by accident.

CREATE TABLE IF NOT EXISTS quizzes (
    id SERIAL PRIMARY KEY,
    homework_id INTEGER NOT NULL UNIQUE,
    max_attempts SMALLINT NOT NULL DEFAULT 2,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quizzes_homework
        FOREIGN KEY (homework_id) REFERENCES homework(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quiz_questions (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    position SMALLINT NOT NULL,
    question_text TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_index SMALLINT NOT NULL,
    explanation TEXT,
    CONSTRAINT fk_quiz_questions_quiz
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_quiz_questions_quiz ON quiz_questions (quiz_id, position);

CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    quiz_id INTEGER NOT NULL,
    student_id INTEGER NOT NULL,
    parent_user_id INTEGER,
    answers JSONB NOT NULL,
    score SMALLINT NOT NULL,
    total SMALLINT NOT NULL,
    is_late BOOLEAN NOT NULL DEFAULT false,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_quiz_attempts_quiz
        FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
    CONSTRAINT fk_quiz_attempts_student
        FOREIGN KEY (student_id) REFERENCES students(id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_student ON quiz_attempts (quiz_id, student_id);
