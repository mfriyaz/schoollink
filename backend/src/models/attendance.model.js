const db = require("../config/database");

/**
 * Mark Attendance
 */
async function createAttendance(data) {

    const query = `
        INSERT INTO attendance
        (
            teacher_subject_id,
            student_id,
            attendance_date,
            status,
            remarks
        )
        VALUES
        (
            $1,$2,$3,$4,$5
        )
        RETURNING *;
    `;

    const values = [

        data.teacher_subject_id,
        data.student_id,
        data.attendance_date,
        data.status,
        data.remarks || null

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get Attendance By Date
 */
async function getAttendanceByDate(teacherSubjectId, attendanceDate) {

    const query = `
        SELECT
            a.*,
            s.first_name,
            s.last_name,
            s.admission_no
        FROM attendance a
        JOIN students s
            ON a.student_id = s.id
        WHERE
            a.teacher_subject_id = $1
            AND a.attendance_date = $2
        ORDER BY
            s.first_name;
    `;

    const result = await db.query(query, [

        teacherSubjectId,
        attendanceDate

    ]);

    return result.rows;

}

/**
 * Get Attendance By Student
 */
async function getAttendanceByStudent(studentId) {

    const result = await db.query(
        `
        SELECT *
        FROM attendance
        WHERE student_id=$1
        ORDER BY attendance_date DESC
        `,
        [studentId]
    );

    return result.rows;

}

/**
 * Update Attendance
 */
async function updateAttendance(id, data) {

    const query = `
        UPDATE attendance
        SET
            status=$1,
            remarks=$2,
            updated_at=NOW()
        WHERE id=$3
        RETURNING *;
    `;

    const result = await db.query(query, [

        data.status,
        data.remarks || null,
        id

    ]);

    return result.rows[0];

}

/**
 * Delete Attendance
 */
async function deleteAttendance(id) {

    const result = await db.query(
        `
        DELETE FROM attendance
        WHERE id=$1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];

}

/**
 * Get Class Roster With Attendance For A Date
 * (every active student in this class/section, LEFT JOINed
 * with any attendance already marked for the given date -
 * powers the Take Attendance screen)
 */
async function getRosterWithAttendance(teacherSubjectId, attendanceDate, session = "Day") {

    const query = `
        SELECT
            st.id AS student_id,
            st.first_name,
            st.last_name,
            st.admission_no,
            a.id AS attendance_id,
            a.status,
            a.remarks,
            a.created_at,
            a.updated_at
        FROM teacher_subjects ts
        JOIN students st
            ON st.class_id = ts.class_id
            AND st.section_id = ts.section_id
            AND st.is_active = true
        LEFT JOIN attendance a
            ON a.teacher_subject_id = ts.id
            AND a.student_id = st.id
            AND a.attendance_date = $2
            AND a.session = $3
        WHERE ts.id = $1
        ORDER BY st.first_name;
    `;

    const result = await db.query(
        query,
        [teacherSubjectId, attendanceDate, session]
    );

    return result.rows;

}

/**
 * Bulk Mark Attendance
 * (upserts one row per student for a given class/date -
 * relies on the existing uq_attendance_student_date constraint)
 */
async function bulkUpsertAttendance(teacherSubjectId, attendanceDate, records, session = "Day") {

    const results = [];

    for (const record of records) {

        const query = `
            INSERT INTO attendance
            (teacher_subject_id, student_id, attendance_date, status, remarks, session)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (teacher_subject_id, student_id, attendance_date, session)
            DO UPDATE SET
                status = EXCLUDED.status,
                remarks = EXCLUDED.remarks,
                updated_at = CURRENT_TIMESTAMP
            RETURNING *;
        `;

        const result = await db.query(
            query,
            [
                teacherSubjectId,
                record.student_id,
                attendanceDate,
                record.status,
                record.remarks || null,
                session
            ]
        );

        results.push(result.rows[0]);

    }

    return results;

}

/**
 * Verify a teacher (by their users.id) actually owns the given
 * teacher_subject_id - prevents marking attendance for a class
 * that isn't theirs.
 */
async function teacherOwnsAssignment(userId, teacherSubjectId) {

    const result = await db.query(
        `
        SELECT ts.id
        FROM teacher_subjects ts
        JOIN teachers t ON ts.teacher_id = t.id
        WHERE t.user_id = $1
        AND ts.id = $2
        AND ts.ended_at IS NULL
        `,
        [userId, teacherSubjectId]
    );

    return result.rows.length > 0;

}

/**
 * Verify a parent (by their users.id) is actually linked to
 * the given student - prevents viewing another family's
 * attendance record by guessing a student ID.
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
 * What is already saved for this class, date and session (used to work out
 * what a save is about to change).
 */
async function getExistingForSave(teacherSubjectId, attendanceDate, session) {

    const result = await db.query(
        `
        SELECT a.student_id, a.status, st.first_name, st.last_name
        FROM attendance a
        JOIN students st ON st.id = a.student_id
        WHERE a.teacher_subject_id = $1
          AND a.attendance_date = $2
          AND a.session = $3
        `,
        [teacherSubjectId, attendanceDate, session]
    );

    return result.rows;

}

/**
 * "4std", "A", "Maths" for the activity log
 */
async function getAssignmentLabel(teacherSubjectId) {

    const result = await db.query(
        `
        SELECT c.class_name, sec.section_name, sub.subject_name
        FROM teacher_subjects ts
        LEFT JOIN classes c ON c.id = ts.class_id
        LEFT JOIN sections sec ON sec.id = ts.section_id
        LEFT JOIN subjects sub ON sub.id = ts.subject_id
        WHERE ts.id = $1
        `,
        [teacherSubjectId]
    );

    return result.rows[0] || {};

}

const ATTENDANCE_MODES = ["subject", "daily", "half_day"];

/**
 * How this school takes attendance: by subject (default), once a day,
 * or morning and afternoon.
 */
async function getAttendanceMode(schoolId) {

    try {

        const r = await db.query("SELECT attendance_mode FROM schools WHERE id = $1", [schoolId]);

        const mode = r.rows[0] && r.rows[0].attendance_mode;

        return ATTENDANCE_MODES.includes(mode) ? mode : "subject";

    } catch (e) {

        return "subject"; // column not added yet

    }

}

async function setAttendanceMode(schoolId, mode) {

    await db.query("UPDATE schools SET attendance_mode = $1 WHERE id = $2", [mode, schoolId]);

}

/**
 * Is this assignment the class teacher's (the one who takes the daily attendance)?
 */
async function isClassTeacherAssignment(teacherSubjectId) {

    const r = await db.query(
        "SELECT is_class_teacher FROM teacher_subjects WHERE id = $1",
        [teacherSubjectId]
    );

    return !!(r.rows[0] && r.rows[0].is_class_teacher);

}

module.exports = {

    ATTENDANCE_MODES,

    getExistingForSave,

    getAssignmentLabel,

    getAttendanceMode,

    setAttendanceMode,

    isClassTeacherAssignment,

    createAttendance,

    getAttendanceByDate,

    getAttendanceByStudent,

    updateAttendance,

    deleteAttendance,

    getRosterWithAttendance,

    bulkUpsertAttendance,

    teacherOwnsAssignment,

    parentOwnsStudent

};