-- Links an announcement to one or more specific classes.
-- When present, these rows narrow acknowledgement tracking
-- down to just these classes' students, regardless of the
-- broad target_audience label (e.g. "Std 5 & 6" from the mockup,
-- instead of every student matching a broad category).
-- Absence of any row here means the broad target_audience
-- applies as before (e.g. "All").

CREATE TABLE announcement_classes (
    id SERIAL PRIMARY KEY,

    announcement_id INTEGER NOT NULL,

    class_id INTEGER NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_announcement_classes_announcement
        FOREIGN KEY (announcement_id)
        REFERENCES announcements(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_announcement_classes_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id),

    CONSTRAINT uq_announcement_classes_pair
        UNIQUE (announcement_id, class_id)
);
