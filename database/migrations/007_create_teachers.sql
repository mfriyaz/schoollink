CREATE TABLE teachers (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    employee_no VARCHAR(30) NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100),

    gender VARCHAR(10),

    date_of_birth DATE,

    phone VARCHAR(20),

    email VARCHAR(150),

    address TEXT,

    qualification VARCHAR(150),

    experience_years INTEGER,

    joining_date DATE,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_teachers_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id),

    CONSTRAINT uq_teachers_employee_no
        UNIQUE (school_id, employee_no)
);
