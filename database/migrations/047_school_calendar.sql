-- School calendar: weekly off days (e.g. Sat/Sun) and holidays /
-- special working days. Attendance is not taken on off days, and
-- parents see "Weekend" / "Holiday" instead of "Not marked".

CREATE TABLE IF NOT EXISTS school_calendar_settings (
    school_id INTEGER PRIMARY KEY REFERENCES schools(id),
    -- 0 = Sunday ... 6 = Saturday
    weekly_off_days INTEGER[] NOT NULL DEFAULT '{0,6}',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS school_calendar_days (
    id SERIAL PRIMARY KEY,
    school_id INTEGER NOT NULL REFERENCES schools(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    -- 'Holiday' = school closed. 'Working Day' = school open even
    -- though it would normally be a weekly off day (e.g. make-up Saturday).
    kind VARCHAR(20) NOT NULL DEFAULT 'Holiday'
        CHECK (kind IN ('Holiday', 'Working Day')),
    name VARCHAR(150) NOT NULL,
    created_by INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_calendar_dates CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS idx_calendar_days_school_dates
    ON school_calendar_days (school_id, start_date, end_date);
