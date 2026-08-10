-- Backfills several structural gaps that existed on local
-- development (added manually, outside any tracked migration)
-- but were missing from a fresh database that only ran the
-- migration files in this folder. Discovered by diffing the
-- local and a fresh production database's schemas directly.
--
-- The `classes` table specifically had an entirely outdated
-- structure (academic_year/section as text columns - the design
-- from before classes and sections were split into separate
-- tables). Since a fresh database has no data in `classes` yet,
-- it's safe to drop and recreate here; on an already-populated
-- database, this section should NOT be run as-is - it would
-- need a real data migration instead.

DROP TABLE IF EXISTS classes CASCADE;

CREATE TABLE classes (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    academic_year_id INTEGER NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
    class_name VARCHAR(100) NOT NULL,
    class_order INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE announcement_classes
    ADD CONSTRAINT fk_announcement_classes_class
    FOREIGN KEY (class_id) REFERENCES classes(id);

ALTER TABLE sections
    ADD CONSTRAINT sections_class_id_fkey
    FOREIGN KEY (class_id) REFERENCES classes(id);

ALTER TABLE students
    ADD CONSTRAINT students_class_id_fkey
    FOREIGN KEY (class_id) REFERENCES classes(id);

ALTER TABLE teacher_subjects
    ADD CONSTRAINT teacher_subjects_class_id_fkey
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE;

-- Smaller missing columns, found the same way.

ALTER TABLE exams
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

ALTER TABLE sections
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE student_marks
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE teacher_subjects
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE announcements
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE schools
    ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id),
    ADD COLUMN IF NOT EXISTS updated_by INTEGER REFERENCES users(id);
