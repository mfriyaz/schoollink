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
 * Get Classes By Academic Year - scoped to one school
 */
async function getClassesByAcademicYear(academicYearId, schoolId) {

    const query = `
        SELECT *
        FROM classes
        WHERE academic_year_id = $1 AND school_id = $2
        ORDER BY class_order;
    `;

    const result = await pool.query(query, [academicYearId, schoolId]);

    return result.rows;

}

/**
 * Get Classes By School
 */
async function getClassesBySchool(schoolId) {

    const query = `
        SELECT *
        FROM classes
        WHERE school_id = $1
        AND is_active = true
        ORDER BY class_order;
    `;

    const result = await pool.query(query, [schoolId]);

    return result.rows;

}

/**
 * Get All Classes For School (including inactive)
 * - used by the Classes management page, unlike
 * getClassesBySchool which is active-only (for pickers)
 */
async function getAllClassesForSchool(schoolId) {

    const query = `
        SELECT *
        FROM classes
        WHERE school_id = $1
        ORDER BY class_order;
    `;

    const result = await pool.query(query, [schoolId]);

    return result.rows;

}

/**
 * Get Class By ID - scoped to one school
 */
async function getClassById(id, schoolId) {

    const result = await pool.query(

        `SELECT * FROM classes WHERE id = $1 AND school_id = $2`,

        [id, schoolId]

    );

    return result.rows[0];

}

/**
 * Update Class - scoped to one school
 */
async function updateClass(id, schoolId, data) {

    const query = `
        UPDATE classes
        SET
            class_name = $1,
            class_order = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND school_id = $4
        RETURNING *;
    `;

    const values = [

        data.class_name,

        data.class_order,

        id,

        schoolId

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/**
 * Deactivate Class (soft delete)
 * - classes with students/teacher_subjects tied to them can't
 * be safely erased without either orphaning that data or
 * crashing on a foreign key constraint
 */
async function deactivateClass(id, schoolId) {

    const result = await pool.query(

        `
        UPDATE classes
        SET is_active = false, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND school_id = $2
        RETURNING *;
        `,

        [id, schoolId]

    );

    return result.rows[0];

}

/**
 * Reactivate Class
 */
async function reactivateClass(id, schoolId) {

    const result = await pool.query(

        `
        UPDATE classes
        SET is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 AND school_id = $2
        RETURNING *;
        `,

        [id, schoolId]

    );

    return result.rows[0];

}

module.exports = {

    createClass,

    getClassesByAcademicYear,

    getClassesBySchool,

    getAllClassesForSchool,

    getClassById,

    updateClass,

    deactivateClass,

    reactivateClass

};
