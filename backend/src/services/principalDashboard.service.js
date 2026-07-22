const db = require("../config/database");

/**
 * Get Principal Dashboard
 */
async function getPrincipalDashboard() {

    /*
     * Total Students
     */
    const studentResult = await db.query(`
        SELECT COUNT(*) AS total_students
        FROM students;
    `);

    /*
     * Total Teachers
     */
    const teacherResult = await db.query(`
        SELECT COUNT(*) AS total_teachers
        FROM teachers;
    `);

    /*
     * Total Classes
     */
    const classResult = await db.query(`
        SELECT COUNT(*) AS total_classes
        FROM classes;
    `);

    /*
     * Total Subjects
     */
    const subjectResult = await db.query(`
        SELECT COUNT(*) AS total_subjects
        FROM subjects;
    `);

    /*
     * Today's Attendance
     */
    const attendanceResult = await db.query(`
        SELECT
            COUNT(*) FILTER (WHERE status='Present') AS present,
            COUNT(*) FILTER (WHERE status='Absent') AS absent,
            COUNT(*) FILTER (WHERE status='Late') AS late
        FROM attendance
        WHERE attendance_date = CURRENT_DATE;
    `);

    /*
     * Homework Given Today
     */
    const homeworkResult = await db.query(`
        SELECT COUNT(*) AS total_homework
        FROM homework
        WHERE homework_date = CURRENT_DATE;
    `);

    /*
     * Upcoming Exams
     */
    const examResult = await db.query(`
        SELECT COUNT(*) AS upcoming_exams
        FROM exams
        WHERE start_date >= CURRENT_DATE;
    `);

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