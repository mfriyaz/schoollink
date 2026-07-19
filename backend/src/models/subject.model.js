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
 * Get Subjects By School
 */
async function getSubjectsBySchool(schoolId) {

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
 * Get Subject By ID
 */
async function getSubjectById(id) {

    const result = await db.query(
        "SELECT * FROM subjects WHERE id = $1",
        [id]
    );

    return result.rows[0];

}

/**
 * Update Subject
 */
async function updateSubject(id, data) {

    const query = `
        UPDATE subjects
        SET
            subject_name = $1,
            subject_code = $2
        WHERE id = $3
        RETURNING *;
    `;

    const values = [
        data.subject_name,
        data.subject_code,
        id
    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Delete Subject
 */
async function deleteSubject(id) {

    const result = await db.query(
        "DELETE FROM subjects WHERE id = $1 RETURNING *",
        [id]
    );

    return result.rows[0];

}

module.exports = {

    createSubject,

    getSubjectsBySchool,

    getSubjectById,

    updateSubject,

    deleteSubject

};