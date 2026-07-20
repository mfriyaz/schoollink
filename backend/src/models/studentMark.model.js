const db = require("../config/database");

/**
 * Create Student Mark
 */
async function createStudentMark(data) {

    const query = `
        INSERT INTO student_marks
        (
            exam_subject_id,
            student_id,
            marks_obtained,
            remarks
        )
        VALUES
        (
            $1,$2,$3,$4
        )
        RETURNING *;
    `;

    const values = [

        data.exam_subject_id,
        data.student_id,
        data.marks_obtained,
        data.remarks

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get Marks By Exam Subject
 */
async function getMarksByExamSubject(examSubjectId) {

    const result = await db.query(
        `
        SELECT *
        FROM student_marks
        WHERE exam_subject_id = $1
        ORDER BY student_id;
        `,
        [examSubjectId]
    );

    return result.rows;

}

/**
 * Get Marks By Student
 */
async function getMarksByStudent(studentId) {

    const result = await db.query(
        `
        SELECT *
        FROM student_marks
        WHERE student_id = $1
        ORDER BY id;
        `,
        [studentId]
    );

    return result.rows;

}

/**
 * Get Student Mark By ID
 */
async function getStudentMarkById(id) {

    const result = await db.query(
        `
        SELECT *
        FROM student_marks
        WHERE id = $1;
        `,
        [id]
    );

    return result.rows[0];

}

/**
 * Update Student Mark
 */
async function updateStudentMark(id, data) {

    const query = `
        UPDATE student_marks
        SET
            marks_obtained = $1,
            remarks = $2,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
        RETURNING *;
    `;

    const values = [

        data.marks_obtained,
        data.remarks,
        id

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Delete Student Mark
 */
async function deleteStudentMark(id) {

    const result = await db.query(
        `
        DELETE FROM student_marks
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];

}

module.exports = {

    createStudentMark,

    getMarksByExamSubject,

    getMarksByStudent,

    getStudentMarkById,

    updateStudentMark,

    deleteStudentMark

};