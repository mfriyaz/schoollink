const pool = require("../config/database");

async function getDashboardSummary() {

    // Active Students
    const students = await pool.query(`
        SELECT COUNT(*)
        FROM students
        WHERE is_active = true
    `);

    // Active Teachers
    const teachers = await pool.query(`
        SELECT COUNT(*)
        FROM teachers
        WHERE is_active = true
    `);

    // Active Classes
    const classes = await pool.query(`
        SELECT COUNT(*)
        FROM classes
        WHERE is_active = true
    `);

    // Temporary Attendance Percentage
    const attendance = 97;

    // Today's Birthdays
    const birthdays = await pool.query(`
        SELECT
            id,
            first_name,
            last_name,
            date_of_birth
        FROM students
        WHERE
            EXTRACT(MONTH FROM date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND
            EXTRACT(DAY FROM date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
        ORDER BY first_name
        LIMIT 10
    `);

    // Recently Added Students
    const recentStudents = await pool.query(`
        SELECT
            id,
            admission_no,
            first_name,
            last_name,
            created_at
        FROM students
        ORDER BY created_at DESC
        LIMIT 10
    `);

    return {

        students: Number(students.rows[0].count),

        teachers: Number(teachers.rows[0].count),

        classes: Number(classes.rows[0].count),

        attendance,

        birthdays: birthdays.rows,

        recentStudents: recentStudents.rows

    };

}

module.exports = {

    getDashboardSummary

};