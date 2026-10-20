const pool = require("../config/database");

/**
 * The school's current academic year.
 * Every record that belongs to a year (students, exams, classes,
 * teacher assignments) is filed under this, chosen by the server,
 * so a school never ends up on another school's year.
 *
 * A school with no year yet gets a default one the first time it is needed.
 */
function defaultYearFor(date = new Date()) {

    const y = date.getMonth() >= 5 ? date.getFullYear() : date.getFullYear() - 1;

    return {
        year_name: `${y}-${y + 1}`,
        start_date: `${y}-06-01`,
        end_date: `${y + 1}-05-31`
    };

}

async function getCurrentYear(schoolId, db = pool) {

    let result = await db.query(
        `
        SELECT * FROM academic_years
        WHERE school_id = $1 AND is_active = true AND is_current = true
        ORDER BY start_date DESC
        LIMIT 1
        `,
        [schoolId]
    );

    if (result.rows[0]) return result.rows[0];

    result = await db.query(
        `
        SELECT * FROM academic_years
        WHERE school_id = $1 AND is_active = true
        ORDER BY start_date DESC
        LIMIT 1
        `,
        [schoolId]
    );

    if (result.rows[0]) return result.rows[0];

    const d = defaultYearFor();

    result = await db.query(
        `
        INSERT INTO academic_years (school_id, year_name, start_date, end_date, is_current)
        VALUES ($1, $2, $3, $4, true)
        RETURNING *
        `,
        [schoolId, d.year_name, d.start_date, d.end_date]
    );

    return result.rows[0];

}

async function getCurrentYearId(schoolId, db = pool) {

    const year = await getCurrentYear(schoolId, db);

    return year.id;

}

module.exports = { getCurrentYear, getCurrentYearId, defaultYearFor };
