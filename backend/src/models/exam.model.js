const db = require("../config/database");

/**
 * Create Exam
 */
async function createExam(data) {

    const query = `
        INSERT INTO exams
        (
            school_id,
            academic_year_id,
            exam_name,
            start_date,
            end_date
        )
        VALUES
        (
            $1,$2,$3,$4,$5
        )
        RETURNING *;
    `;

    const values = [

        data.school_id,
        data.academic_year_id,
        data.exam_name,
        data.start_date,
        data.end_date

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get All Exams
 */
async function getAllExams(schoolId) {

    const query = `
        SELECT *
        FROM exams
        WHERE school_id = $1
        ORDER BY start_date DESC;
    `;

    const result = await db.query(query, [schoolId]);

    return result.rows;

}

/**
 * Get Exam By ID
 */
async function getExamById(id, schoolId) {

    const result = await db.query(
        `
        SELECT *
        FROM exams
        WHERE id = $1
        AND school_id = $2
        `,
        [id, schoolId]
    );

    return result.rows[0];

}

/**
 * Update Exam
 */
async function updateExam(id, data) {

    const query = `
        UPDATE exams
        SET
            exam_name = $1,
            start_date = $2,
            end_date = $3,
            updated_at = NOW()
        WHERE id = $4
        RETURNING *;
    `;

    const values = [

        data.exam_name,
        data.start_date,
        data.end_date,
        id

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Delete Exam
 */
async function deleteExam(id) {

    const result = await db.query(
        `
        DELETE FROM exams
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];

}

module.exports = {

    createExam,

    getAllExams,

    getExamById,

    updateExam,

    deleteExam

};