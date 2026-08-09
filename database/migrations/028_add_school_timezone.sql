-- Adds a per-school IANA timezone (e.g. 'Asia/Singapore',
-- 'Asia/Kolkata'), since schools on this platform can be in
-- different countries/regions. Timestamps are stored in UTC
-- as always; this lets the frontend display them correctly
-- for each school rather than relying on the viewer's own
-- browser timezone, which is only coincidentally correct when
-- the viewer happens to be in the same region as the school.

ALTER TABLE schools
    ADD COLUMN timezone VARCHAR(50) DEFAULT 'Asia/Singapore';
