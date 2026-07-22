const db = require("../config/database");

/**
 * Get Teacher Dashboard
 */
async function getTeacherDashboard(teacherId) {

    /*
     * Get Teacher Information
     */
    const teacherResult = await db.query(
        `
        SELECT
            id,
            first_name,
            last_name
        FROM teachers
        WHERE id = $1
        `,
        [teacherId]
    );

    if (teacherResult.rows.length === 0) {
        throw new Error("Teacher not found.");
    }

    /*
     * Total Classes
     */
    const classResult = await db.query(
        `
        SELECT COUNT(DISTINCT class_id) AS total_classes
        FROM teacher_subjects
        WHERE teacher_id = $1
          AND is_active = true
        `,
        [teacherId]
    );

    /*
     * Total Subjects
     */
    const subjectResult = await db.query(
        `
        SELECT COUNT(DISTINCT subject_id) AS total_subjects
        FROM teacher_subjects
        WHERE teacher_id = $1
          AND is_active = true
        `,
        [teacherId]
    );

    /*
     * Total Students
     */
    const studentResult = await db.query(
        `
        SELECT COUNT(DISTINCT s.id) AS total_students
        FROM students s
        INNER JOIN teacher_subjects ts
            ON s.class_id = ts.class_id
        WHERE ts.teacher_id = $1
          AND ts.is_active = true
        `,
        [teacherId]
    );

    /*
     * Today's Attendance
     */
    const attendanceResult = await db.query(
        `
        SELECT
            COUNT(*) FILTER (WHERE a.status = 'Present') AS present,
            COUNT(*) FILTER (WHERE a.status = 'Absent') AS absent,
            COUNT(*) FILTER (WHERE a.status = 'Late') AS late
        FROM attendance a
        INNER JOIN teacher_subjects ts
            ON a.teacher_subject_id = ts.id
        WHERE ts.teacher_id = $1
          AND a.attendance_date = CURRENT_DATE
        `,
        [teacherId]
    );

    /*
     * Today's Homework
     */
    const homeworkResult = await db.query(
        `
        SELECT COUNT(*) AS total_homework
        FROM homework h
        INNER JOIN teacher_subjects ts
            ON h.teacher_subject_id = ts.id
        WHERE ts.teacher_id = $1
          AND h.homework_date = CURRENT_DATE
        `,
        [teacherId]
    );

    /*
     * Upcoming Exams
     */
    const examResult = await db.query(
        `
        SELECT COUNT(DISTINCT e.id) AS upcoming_exams
        FROM exams e
        INNER JOIN exam_subjects es
            ON e.id = es.exam_id
        INNER JOIN teacher_subjects ts
            ON es.teacher_subject_id = ts.id
        WHERE ts.teacher_id = $1
          AND e.start_date >= CURRENT_DATE
        `,
        [teacherId]
    );

    return {

        teacher: {

            id: teacherResult.rows[0].id,
            name:
                teacherResult.rows[0].first_name +
                " " +
                teacherResult.rows[0].last_name

        },

        statistics: {

            classes:
                Number(classResult.rows[0].total_classes),

            subjects:
                Number(subjectResult.rows[0].total_subjects),

            students:
                Number(studentResult.rows[0].total_students)

        },

        attendance: {

            present:
                Number(attendanceResult.rows[0].present || 0),

            absent:
                Number(attendanceResult.rows[0].absent || 0),

            late:
                Number(attendanceResult.rows[0].late || 0)

        },

        homework: {

            today:
                Number(homeworkResult.rows[0].total_homework)

        },

        exams: {

            upcoming:
                Number(examResult.rows[0].upcoming_exams)

        }

    };

}

module.exports = {

    getTeacherDashboard

};