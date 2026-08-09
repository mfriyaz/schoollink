-- Adds platform-governance columns to schools, so a Super Admin
-- can cap how much a school can create (matching the school's
-- subscription tier), rather than every school having unlimited
-- capacity by default. NULL means "no limit set yet" - existing
-- schools aren't retroactively capped until a Super Admin sets one.

ALTER TABLE schools
    ADD COLUMN max_classes INTEGER,
    ADD COLUMN max_students INTEGER,
    ADD COLUMN max_teachers INTEGER;
