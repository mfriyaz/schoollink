CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,
    role_id INTEGER NOT NULL,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(150) UNIQUE,

    mobile VARCHAR(20),

    password_hash TEXT NOT NULL,

    is_active BOOLEAN DEFAULT TRUE,

    last_login TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id),

    CONSTRAINT fk_users_role
        FOREIGN KEY (role_id)
        REFERENCES roles(id)
);