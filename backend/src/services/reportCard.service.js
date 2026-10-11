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
            es.pass_marks,

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

/**
 * Extra details printed on the PDF: school letterhead, academic year, grading scale
 */
async function getPdfExtras(schoolId, examId) {

    const school = await db.query(
        `SELECT school_name, address, city, state, country, postal_code,
                phone, email, website, logo_url, theme, timezone
         FROM schools WHERE id = $1`,
        [schoolId]
    ).catch(() => ({ rows: [] }));

    const year = await db.query(
        `SELECT ay.year_name
         FROM exams e
         JOIN academic_years ay ON ay.id = e.academic_year_id
         WHERE e.id = $1`,
        [examId]
    ).catch(() => ({ rows: [] }));

    const grades = await db.query(
        `SELECT grade_name, minimum_percentage, maximum_percentage
         FROM grades WHERE school_id = $1
         ORDER BY minimum_percentage DESC`,
        [schoolId]
    ).catch(() => ({ rows: [] }));

    return {
        school: school.rows[0] || {},
        academic_year: year.rows[0] ? year.rows[0].year_name : "",
        grades: grades.rows
    };

}

/**
 * Remarks for one student + exam (null when none, or before migration 054)
 */
async function getRemarks(studentId, examId) {

    try {

        const result = await db.query(
            `SELECT remarks, updated_at
             FROM report_card_remarks
             WHERE student_id = $1 AND exam_id = $2`,
            [studentId, examId]
        );

        return result.rows[0] || null;

    } catch (err) {

        return null;

    }

}

/**
 * All remarks for a student, with the exam name (used by the parent portal)
 */
async function listRemarksForStudent(studentId) {

    try {

        const result = await db.query(
            `SELECT e.exam_name, r.remarks, r.updated_at
             FROM report_card_remarks r
             JOIN exams e ON e.id = r.exam_id
             WHERE r.student_id = $1
             ORDER BY r.updated_at DESC`,
            [studentId]
        );

        return result.rows;

    } catch (err) {

        return [];

    }

}

async function saveRemarks({ schoolId, studentId, examId, remarks, userId, aiAssisted }) {

    const text = String(remarks || "").trim();

    if (!text) {

        await db.query(
            "DELETE FROM report_card_remarks WHERE student_id = $1 AND exam_id = $2 AND school_id = $3",
            [studentId, examId, schoolId]
        );

        return null;

    }

    const result = await db.query(
        `INSERT INTO report_card_remarks (school_id, student_id, exam_id, remarks, updated_by, ai_assisted)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (student_id, exam_id)
         DO UPDATE SET remarks = EXCLUDED.remarks,
                       updated_by = EXCLUDED.updated_by,
                       ai_assisted = EXCLUDED.ai_assisted,
                       updated_at = NOW()
         RETURNING remarks, updated_at`,
        [schoolId, studentId, examId, text, userId, !!aiAssisted]
    );

    return result.rows[0];

}

module.exports = {

    getStudentReportCard,

    getRemarks,

    getPdfExtras,

    listRemarksForStudent,

    saveRemarks,

    parentOwnsStudent

};