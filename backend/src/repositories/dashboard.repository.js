const pool = require("../config/database");

async function getStudentCount() {

    const result = await pool.query(

        `SELECT COUNT(*) FROM students WHERE is_active = true`

    );

    return Number(result.rows[0].count);

}

async function getTeacherCount() {

    const result = await pool.query(

        `SELECT COUNT(*) FROM teachers WHERE is_active = true`

    );

    return Number(result.rows[0].count);

}

async function getClassCount() {

    const result = await pool.query(

        `SELECT COUNT(*) FROM classes WHERE is_active = true`

    );

    return Number(result.rows[0].count);

}

async function getRecentStudents() {

    const result = await pool.query(`

        SELECT

            id,

            admission_no,

            first_name,

            last_name,

            created_at

        FROM students

        ORDER BY created_at DESC

        LIMIT 5

    `);

    return result.rows;

}

async function getBirthdays() {

    const result = await pool.query(`

        SELECT

            first_name,

            last_name,

            date_of_birth

        FROM students

        WHERE

            EXTRACT(MONTH FROM date_of_birth)=EXTRACT(MONTH FROM CURRENT_DATE)

        AND

            EXTRACT(DAY FROM date_of_birth)=EXTRACT(DAY FROM CURRENT_DATE)

    `);

    return result.rows;

}

async function getAnnouncements(schoolId = 1) {

    const result = await pool.query(

        `

        SELECT

            id,

            title,

            description,

            target_audience,

            publish_date

        FROM announcements

        WHERE school_id = $1

        AND is_active = true

        ORDER BY publish_date DESC

        LIMIT 5

        `,

        [schoolId]

    );

    return result.rows;

}

module.exports = {

    getStudentCount,

    getTeacherCount,

    getClassCount,

    getRecentStudents,

    getBirthdays,

    getAnnouncements

};