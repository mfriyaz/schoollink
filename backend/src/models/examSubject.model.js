const db = require("../config/database");

/**
 * Assign Subject To Exam
 */
async function createExamSubject(data) {

    const query = `
        INSERT INTO exam_subjects
        (
            exam_id,
            teacher_subject_id,
            max_marks,
            pass_marks
        )
        VALUES
        (
            $1,$2,$3,$4
        )
        RETURNING *;
    `;

    const values = [

        data.exam_id,
        data.teacher_subject_id,
        data.max_marks,
        data.pass_marks

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get Subjects By Exam
 */
async function getSubjectsByExam(examId) {

    const query = `
        SELECT *
        FROM exam_subjects
        WHERE exam_id = $1
        ORDER BY id;
    `;

    const result = await db.query(query, [examId]);

    return result.rows;

}

/**
 * Get Exam Subject By ID
 */
async function getExamSubjectById(id) {

    const result = await db.query(
        `
        SELECT *
        FROM exam_subjects
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];

}

/**
 * Update Exam Subject
 */
async function updateExamSubject(id, data) {

    const query = `
        UPDATE exam_subjects
        SET
            max_marks = $1,
            pass_marks = $2
        WHERE id = $3
        RETURNING *;
    `;

    const values = [

        data.max_marks,
        data.pass_marks,
        id

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Delete Exam Subject
 */
async function deleteExamSubject(id) {

    const result = await db.query(
        `
        DELETE FROM exam_subjects
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];

}

module.exports = {

    createExamSubject,

    getSubjectsByExam,

    getExamSubjectById,

    updateExamSubject,

    deleteExamSubject

};