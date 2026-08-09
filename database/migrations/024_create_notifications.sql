-- In-app notifications feed. One row per notification per
-- recipient (not shared/broadcast rows), so read-state is
-- always per-user.

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,

    user_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    message TEXT,

    link VARCHAR(255),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notifications_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_notifications_user_unread
    ON notifications (user_id, is_read);
