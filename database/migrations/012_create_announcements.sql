CREATE TABLE announcements (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    title VARCHAR(200) NOT NULL,

    description TEXT,

    target_audience VARCHAR(50) DEFAULT 'All',

    publish_date DATE NOT NULL,

    expiry_date DATE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_announcements_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id)
);
