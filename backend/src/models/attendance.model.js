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

module.exports = {

    createAttendance,

    getAttendanceByDate,

    getAttendanceByStudent,

    updateAttendance,

    deleteAttendance

};