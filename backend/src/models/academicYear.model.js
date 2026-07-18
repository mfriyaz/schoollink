const pool = require("../config/database");

/**
 * Create Academic Year
 */
async function createAcademicYear(data, db = pool) {

    const query = `
        INSERT INTO academic_years
        (
            school_id,
            year_name,
            start_date,
            end_date,
            is_current
        )
        VALUES
        (
            $1,$2,$3,$4,$5
        )
        RETURNING *;
    `;

    const values = [

        data.school_id,

        data.year_name,

        data.start_date,

        data.end_date,

        data.is_current

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get All Academic Years By School
 */
async function getAcademicYearsBySchool(schoolId) {

    const query = `
        SELECT *
        FROM academic_years
        WHERE school_id = $1
        AND is_active = true
        ORDER BY start_date DESC;
    `;

    const result = await pool.query(query, [schoolId]);

    return result.rows;

}

/**
 * Get Academic Year By ID
 */
async function getAcademicYearById(id) {

    const query = `
        SELECT *
        FROM academic_years
        WHERE id = $1
        LIMIT 1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

}

/**
 * Update Academic Year
 */
async function updateAcademicYear(id, data) {

    const query = `
        UPDATE academic_years
        SET
            year_name = $1,
            start_date = $2,
            end_date = $3,
            is_current = $4,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $5
        RETURNING *;
    `;

    const values = [

        data.year_name,

        data.start_date,

        data.end_date,

        data.is_current,

        id

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/**
 * Soft Delete Academic Year
 */
async function deleteAcademicYear(id) {

    const query = `
        UPDATE academic_years
        SET
            is_active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];

}

module.exports = {

    createAcademicYear,

    getAcademicYearsBySchool,

    getAcademicYearById,

    updateAcademicYear,

    deleteAcademicYear

};