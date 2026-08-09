-- A daily "Good Morning" voice check-in from a parent/student to
-- their class teacher - separate from homework, since it's not
-- tied to any specific post. One greeting per student per day;
-- resubmitting the same day replaces it rather than duplicating.

CREATE TABLE morning_greetings (
    id SERIAL PRIMARY KEY,

    student_id INTEGER NOT NULL,

    parent_user_id INTEGER NOT NULL,

    voice_url TEXT NOT NULL,

    greeting_date DATE NOT NULL DEFAULT CURRENT_DATE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_morning_greetings_student
        FOREIGN KEY (student_id)
        REFERENCES students(id),

    CONSTRAINT fk_morning_greetings_parent
        FOREIGN KEY (parent_user_id)
        REFERENCES users(id),

    CONSTRAINT uq_morning_greetings_pair
        UNIQUE (student_id, greeting_date)
);
