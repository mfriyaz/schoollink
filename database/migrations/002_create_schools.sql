CREATE TABLE schools (
    id SERIAL PRIMARY KEY,

    school_name VARCHAR(150) NOT NULL,
    school_code VARCHAR(20) UNIQUE,

    address TEXT,

    city VARCHAR(100),

    state VARCHAR(100),

    country VARCHAR(100) DEFAULT 'India',

    postal_code VARCHAR(20),

    phone VARCHAR(20),

    email VARCHAR(150),

    website VARCHAR(255),

    logo_url VARCHAR(255),

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);