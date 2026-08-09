-- Per-user notification preferences for the Settings screen.
-- One row per user, created on first access if it doesn't
-- exist yet (defaults to both notifications on).

CREATE TABLE user_settings (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    email_notifications BOOLEAN DEFAULT TRUE,

    in_app_notifications BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_settings_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT uq_user_settings_user
        UNIQUE (user_id)
);
