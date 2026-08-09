CREATE TABLE students (
    id SERIAL PRIMARY KEY,

    school_id INTEGER NOT NULL,

    academic_year_id INTEGER NOT NULL,

    class_id INTEGER NOT NULL,

    section_id INTEGER NOT NULL,

    admission_no VARCHAR(30) NOT NULL,

    first_name VARCHAR(100) NOT NULL,

    last_name VARCHAR(100),

    gender VARCHAR(10),

    date_of_birth DATE,

    father_name VARCHAR(150),

    mother_name VARCHAR(150),

    parent_phone VARCHAR(20),

    parent_email VARCHAR(150),

    address TEXT,

    is_active BOOLEAN DEFAULT TRUE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_students_school
        FOREIGN KEY (school_id)
        REFERENCES schools(id),

    CONSTRAINT fk_students_academic_year
        FOREIGN KEY (academic_year_id)
        REFERENCES academic_years(id),

    CONSTRAINT fk_students_class
        FOREIGN KEY (class_id)
        REFERENCES classes(id),

    CONSTRAINT fk_students_section
        FOREIGN KEY (section_id)
        REFERENCES sections(id),

    CONSTRAINT uq_students_admission_no
        UNIQUE (school_id, admission_no)
);
