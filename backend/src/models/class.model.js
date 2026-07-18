const pool = require("../config/database");

/**
 * Create Class
 */
async function createClass(data, db = pool) {

    const query = `
        INSERT INTO classes
        (
            school_id,
            academic_year_id,
            class_name,
            class_order,
            is_active
        )
        VALUES
        (
            $1,$2,$3,$4,true
        )
        RETURNING *;
    `;

    const values = [

        data.school_id,
        data.academic_year_id,
        data.class_name,
        data.class_order

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get Classes By Academic Year
 */
async function getClassesByAcademicYear(academicYearId) {

    const query = `
        SELECT *
        FROM classes
        WHERE academic_year_id = $1
        ORDER BY class_order;
    `;

    const result = await pool.query(query, [academicYearId]);

    return result.rows;

}

/**
 * Get Class By ID
 */
async function getClassById(id) {

    const result = await pool.query(

        `SELECT * FROM classes WHERE id = $1`,

        [id]

    );

    return result.rows[0];

}

/**
 * Update Class
 */
async function updateClass(id, data) {

    const query = `
        UPDATE classes
        SET
            class_name = $1,
            class_order = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *;
    `;

    const values = [

        data.class_name,

        data.class_order,

        id

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/**
 * Delete Class
 */
async function deleteClass(id) {

    const result = await pool.query(

        `
        DELETE FROM classes
        WHERE id = $1
        RETURNING *;
        `,

        [id]

    );

    return result.rows[0];

}

module.exports = {

    createClass,

    getClassesByAcademicYear,

    getClassById,

    updateClass,

    deleteClass

};