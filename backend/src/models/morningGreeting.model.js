const db = require("../config/database");

/**
 * Submit (or replace) today's Good Morning greeting for a
 * student. One per student per day.
 */
async function submitGreeting(studentId, parentUserId, voiceUrl) {

    const query = `
        INSERT INTO morning_greetings
        (student_id, parent_user_id, voice_url, greeting_date)
        VALUES ($1, $2, $3, CURRENT_DATE)
        ON CONFLICT (student_id, greeting_date)
        DO UPDATE SET
            voice_url = EXCLUDED.voice_url,
            parent_user_id = EXCLUDED.parent_user_id,
            created_at = CURRENT_TIMESTAMP
        RETURNING *;
    `;

    const result = await db.query(query, [studentId, parentUserId, voiceUrl]);

    return result.rows[0];

}

/**
 * Get today's greeting for a specific student (Parent's own
 * dashboard, to show "already sent" state).
 */
async function getTodaysGreeting(studentId) {

    const result = await db.query(
        `
        SELECT * FROM morning_greetings
        WHERE student_id = $1 AND greeting_date = CURRENT_DATE
        `,
        [studentId]
    );

    return result.rows[0];

}

/**
 * Get today's greetings for every student in a teacher's
 * class(es) - where they're marked as the class teacher.
 */
async function getTodaysGreetingsForClassTeacher(teacherUserId) {

    const result = await db.query(
        `
        SELECT
            mg.*,
            st.first_name,
            st.last_name,
            st.admission_no,
            c.class_name,
            sec.section_name
        FROM teacher_subjects ts
        JOIN teachers t
            ON ts.teacher_id = t.id
            AND t.user_id = $1
        JOIN classes c
            ON ts.class_id = c.id
        JOIN sections sec
            ON ts.section_id = sec.id
        JOIN students st
            ON st.class_id = ts.class_id
            AND st.section_id = ts.section_id
            AND st.is_active = true
        LEFT JOIN morning_greetings mg
            ON mg.student_id = st.id
            AND mg.greeting_date = CURRENT_DATE
        WHERE ts.is_class_teacher = true
        ORDER BY st.first_name
        `,
        [teacherUserId]
    );

    return result.rows;

}

module.exports = {

    submitGreeting,

    getTodaysGreeting,

    getTodaysGreetingsForClassTeacher

};
