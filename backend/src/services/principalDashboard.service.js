const db = require("../config/database");

/**
 * Get Principal Dashboard
 */
async function getPrincipalDashboard(schoolId) {

    /*
     * Total Students
     */
    const studentResult = await db.query(`
        SELECT COUNT(*) AS total_students
        FROM students
        WHERE school_id = $1;
    `, [schoolId]);

    /*
     * Total Teachers
     */
    const teacherResult = await db.query(`
        SELECT COUNT(*) AS total_teachers
        FROM teachers
        WHERE school_id = $1;
    `, [schoolId]);

    /*
     * Total Classes
     */
    const classResult = await db.query(`
        SELECT COUNT(*) AS total_classes
        FROM classes
        WHERE school_id = $1;
    `, [schoolId]);

    /*
     * Total Subjects
     */
    const subjectResult = await db.query(`
        SELECT COUNT(*) AS total_subjects
        FROM subjects
        WHERE school_id = $1;
    `, [schoolId]);

    /*
     * Today's Attendance
     */
    const attendanceResult = await db.query(`
        SELECT
            COUNT(*) FILTER (WHERE a.status='Present') AS present,
            COUNT(*) FILTER (WHERE a.status='Absent') AS absent,
            COUNT(*) FILTER (WHERE a.status='Late') AS late
        FROM attendance a
        JOIN teacher_subjects ts ON ts.id = a.teacher_subject_id
        WHERE a.attendance_date = CURRENT_DATE
          AND ts.school_id = $1;
    `, [schoolId]);

    /*
     * Homework Given Today
     */
    const homeworkResult = await db.query(`
        SELECT COUNT(*) AS total_homework
        FROM homework h
        JOIN teacher_subjects ts ON ts.id = h.teacher_subject_id
        WHERE h.homework_date = CURRENT_DATE
          AND ts.school_id = $1;
    `, [schoolId]);

    /*
     * Upcoming Exams
     */
    const examResult = await db.query(`
        SELECT COUNT(*) AS upcoming_exams
        FROM exams
        WHERE start_date >= CURRENT_DATE
          AND is_active IS NOT FALSE
          AND school_id = $1;
    `, [schoolId]);

    return {

        statistics: {

            students:
                Number(studentResult.rows[0].total_students),

            teachers:
                Number(teacherResult.rows[0].total_teachers),

            classes:
                Number(classResult.rows[0].total_classes),

            subjects:
                Number(subjectResult.rows[0].total_subjects)

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

    getPrincipalDashboard

};