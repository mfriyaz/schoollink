const db = require("../config/database");

/**
 * Get Student Report Card
 */
async function getStudentReportCard(studentId, examId) {

    const query = `
        SELECT

            s.id AS student_id,
            s.admission_no,
            s.first_name,
            s.last_name,
            s.school_id,

            sch.school_name,

            c.class_name,
            sec.section_name,

            e.exam_name,

            sub.subject_name,

            sm.marks_obtained,
            es.max_marks,

            sm.percentage,
            sm.grade_name,
            sm.grade_point,
            sm.result

        FROM student_marks sm

        INNER JOIN students s
            ON sm.student_id = s.id

        INNER JOIN schools sch
            ON s.school_id = sch.id

        INNER JOIN exam_subjects es
            ON sm.exam_subject_id = es.id

        INNER JOIN exams e
            ON es.exam_id = e.id

        INNER JOIN teacher_subjects ts
            ON es.teacher_subject_id = ts.id

        INNER JOIN subjects sub
            ON ts.subject_id = sub.id

        INNER JOIN classes c
            ON ts.class_id = c.id

        INNER JOIN sections sec
            ON ts.section_id = sec.id

        WHERE
            sm.student_id = $1
        AND
            e.id = $2

        ORDER BY sub.subject_name;
    `;

    const result = await db.query(
        query,
        [studentId, examId]
    );

    return result.rows;

}

/**
 * Verify a parent (by their users.id) is actually linked to
 * the given student.
 */
async function parentOwnsStudent(userId, studentId) {

    const result = await db.query(
        `
        SELECT 1
        FROM parent_students
        WHERE parent_user_id = $1
        AND student_id = $2
        `,
        [userId, studentId]
    );

    return result.rows.length > 0;

}

module.exports = {

    getStudentReportCard,

    parentOwnsStudent

};