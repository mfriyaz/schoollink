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
            percentage,
            grade_name,
            grade_point,
            result,
            remarks
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8
        )
        RETURNING *;
    `;

    const values = [

        data.exam_subject_id,
        data.student_id,
        data.marks_obtained,
        data.percentage,
        data.grade_name,
        data.grade_point,
        data.result,
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
 * (joined with exam/subject names - a parent needs to know
 * WHICH exam and subject a mark belongs to, not just the number)
 */
async function getMarksByStudent(studentId) {

    const result = await db.query(
        `
        SELECT
            sm.*,
            e.exam_name,
            s.subject_name
        FROM student_marks sm
        JOIN exam_subjects es
            ON sm.exam_subject_id = es.id
        JOIN exams e
            ON es.exam_id = e.id
        JOIN teacher_subjects ts
            ON es.teacher_subject_id = ts.id
        JOIN subjects s
            ON ts.subject_id = s.id
        WHERE sm.student_id = $1
        ORDER BY sm.id DESC;
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
            percentage = $2,
            grade_name = $3,
            grade_point = $4,
            result = $5,
            remarks = $6,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $7
        RETURNING *;
    `;

    const values = [

        data.marks_obtained,
        data.percentage,
        data.grade_name,
        data.grade_point,
        data.result,
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

/**
 * Get Roster With Marks
 * (every active student in this exam_subject's class/section,
 * LEFT JOINed with any marks already entered - powers the
 * Enter Marks screen, same pattern as attendance's roster)
 */
async function getRosterWithMarks(examSubjectId) {

    const query = `
        SELECT
            st.id AS student_id,
            st.first_name,
            st.last_name,
            st.admission_no,
            sm.id AS mark_id,
            sm.marks_obtained,
            sm.percentage,
            sm.grade_name,
            sm.result
        FROM exam_subjects es
        JOIN teacher_subjects ts
            ON es.teacher_subject_id = ts.id
        JOIN students st
            ON st.class_id = ts.class_id
            AND st.section_id = ts.section_id
            AND st.is_active = true
        LEFT JOIN student_marks sm
            ON sm.exam_subject_id = es.id
            AND sm.student_id = st.id
        WHERE es.id = $1
        ORDER BY st.first_name;
    `;

    const result = await db.query(query, [examSubjectId]);

    return result.rows;

}

/**
 * Bulk Upsert Student Marks
 * (relies on the existing uq_student_marks_unique constraint)
 */
async function bulkUpsertStudentMarks(examSubjectId, records) {

    const results = [];

    for (const record of records) {

        const query = `
            INSERT INTO student_marks
            (exam_subject_id, student_id, marks_obtained, percentage, grade_name, grade_point, result)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            ON CONFLICT (exam_subject_id, student_id)
            DO UPDATE SET
                marks_obtained = EXCLUDED.marks_obtained,
                percentage = EXCLUDED.percentage,
                grade_name = EXCLUDED.grade_name,
                grade_point = EXCLUDED.grade_point,
                result = EXCLUDED.result,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const result = await db.query(
            query,
            [
                examSubjectId,
                record.student_id,
                record.marks_obtained,
                record.percentage,
                record.grade_name,
                record.grade_point,
                record.result
            ]
        );

        results.push(result.rows[0]);

    }

    return results;

}

module.exports = {

    createStudentMark,

    getMarksByExamSubject,

    getMarksByStudent,

    getStudentMarkById,

    updateStudentMark,

    deleteStudentMark,

    getRosterWithMarks,

    bulkUpsertStudentMarks

};