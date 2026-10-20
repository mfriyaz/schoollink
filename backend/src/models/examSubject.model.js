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
async function updateExamSubject(id, schoolId, data) {

    const top = await db.query(
        `
        SELECT MAX(sm.marks_obtained) AS top
        FROM student_marks sm
        JOIN exam_subjects es ON es.id = sm.exam_subject_id
        JOIN exams e ON e.id = es.exam_id
        WHERE es.id = $1 AND e.school_id = $2
        `,
        [id, schoolId]
    );

    if (top.rows[0].top !== null && Number(top.rows[0].top) > Number(data.max_marks)) {
        const err = new Error(`Marks up to ${Number(top.rows[0].top)} are already entered, so max marks can't be lower than that.`);
        err.status = 409;
        throw err;
    }

    const query = `
        UPDATE exam_subjects es
        SET
            max_marks = $1,
            pass_marks = $2
        FROM exams e
        WHERE es.id = $3
        AND e.id = es.exam_id
        AND e.school_id = $4
        RETURNING es.*;
    `;

    const values = [

        data.max_marks,
        data.pass_marks,
        id,
        schoolId

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Delete Exam Subject
 */
async function deleteExamSubject(id, schoolId) {

    const owned = await db.query(
        `
        SELECT es.id
        FROM exam_subjects es
        JOIN exams e ON e.id = es.exam_id
        WHERE es.id = $1 AND e.school_id = $2
        `,
        [id, schoolId]
    );

    if (!owned.rows[0]) return null;

    const marks = await db.query(
        "SELECT COUNT(*)::int AS n FROM student_marks WHERE exam_subject_id = $1",
        [id]
    );

    if (marks.rows[0].n > 0) {
        const err = new Error("Marks are already entered for this subject, so it can't be removed.");
        err.status = 409;
        throw err;
    }

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