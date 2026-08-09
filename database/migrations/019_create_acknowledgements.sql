-- Tracks parent acknowledgement of a post (homework or announcement),
-- matching the mockup's "Acknowledgement Tracking" feature.
-- post_type + post_id is a polymorphic reference (no DB-level FK,
-- since it can point at either the homework or announcements table);
-- integrity for post_id is enforced in the application layer.

CREATE TABLE acknowledgements (
    id SERIAL PRIMARY KEY,

    post_type VARCHAR(20) NOT NULL,

    post_id INTEGER NOT NULL,

    student_id INTEGER NOT NULL,

    parent_user_id INTEGER NOT NULL,

    is_acknowledged BOOLEAN DEFAULT FALSE,

    acknowledged_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_acknowledgements_post_type
        CHECK (post_type IN ('homework', 'announcement')),

    CONSTRAINT fk_acknowledgements_student
        FOREIGN KEY (student_id)
        REFERENCES students(id),

    CONSTRAINT fk_acknowledgements_parent
        FOREIGN KEY (parent_user_id)
        REFERENCES users(id),

    CONSTRAINT uq_acknowledgements_unique
        UNIQUE (post_type, post_id, student_id)
);

CREATE INDEX idx_acknowledgements_post
    ON acknowledgements (post_type, post_id);
