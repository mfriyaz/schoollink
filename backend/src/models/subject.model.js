const db = require("../config/database");

/**
 * Create Subject
 */
async function createSubject(data) {

    const query = `
        INSERT INTO subjects
        (
            school_id,
            subject_name,
            subject_code
        )
        VALUES
        (
            $1,$2,$3
        )
        RETURNING *;
    `;

    const values = [
        data.school_id,
        data.subject_name,
        data.subject_code
    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get Subjects By School (active only - for pickers)
 */
async function getSubjectsBySchool(schoolId) {

    const result = await db.query(
        `
        SELECT *
        FROM subjects
        WHERE school_id = $1 AND is_active = true
        ORDER BY subject_name
        `,
        [schoolId]
    );

    return result.rows;

}

/**
 * Get All Subjects For School For Management (active + inactive)
 */
async function getAllSubjectsForSchool(schoolId) {

    const result = await db.query(
        `
        SELECT *
        FROM subjects
        WHERE school_id = $1
        ORDER BY subject_name
        `,
        [schoolId]
    );

    return result.rows;

}

/**
 * Get Subject By ID - scoped to one school
 */
async function getSubjectById(id, schoolId) {

    const result = await db.query(
        "SELECT * FROM subjects WHERE id = $1 AND school_id = $2",
        [id, schoolId]
    );

    return result.rows[0];

}

/**
 * Update Subject - scoped to one school
 */
async function updateSubject(id, schoolId, data) {

    const query = `
        UPDATE subjects
        SET
            subject_name = $1,
            subject_code = $2
        WHERE id = $3 AND school_id = $4
        RETURNING *;
    `;

    const values = [
        data.subject_name,
        data.subject_code,
        id,
        schoolId
    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Deactivate Subject (soft delete)
 */
async function deactivateSubject(id, schoolId) {

    const result = await db.query(
        `
        UPDATE subjects
        SET is_active = false
        WHERE id = $1 AND school_id = $2
        RETURNING *
        `,
        [id, schoolId]
    );

    return result.rows[0];

}

/**
 * Reactivate Subject
 */
async function reactivateSubject(id, schoolId) {

    const result = await db.query(
        `
        UPDATE subjects
        SET is_active = true
        WHERE id = $1 AND school_id = $2
        RETURNING *
        `,
        [id, schoolId]
    );

    return result.rows[0];

}

module.exports = {

    createSubject,

    getSubjectsBySchool,

    getAllSubjectsForSchool,

    getSubjectById,

    updateSubject,

    deactivateSubject,

    reactivateSubject

};
