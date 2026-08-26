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
            teacher_reaction = NULL,
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

/**
 * Save a teacher's reaction to a greeting.
 */
async function reactToGreeting(greetingId, reaction) {

    const result = await db.query(
        `
        UPDATE morning_greetings
        SET teacher_reaction = $1
        WHERE id = $2
        RETURNING *;
        `,
        [reaction, greetingId]
    );

    return result.rows[0];

}

/**
 * Verify the greeting belongs to one of this teacher's
 * class-teacher students - prevents reacting to a greeting
 * for a student that isn't theirs.
 */
async function teacherOwnsGreeting(greetingId, teacherUserId) {

    const result = await db.query(
        `
        SELECT mg.id
        FROM morning_greetings mg
        JOIN students st ON mg.student_id = st.id
        JOIN teacher_subjects ts
            ON ts.class_id = st.class_id
            AND ts.section_id = st.section_id
            AND ts.is_class_teacher = true
        JOIN teachers t
            ON ts.teacher_id = t.id
            AND t.user_id = $2
        WHERE mg.id = $1
        `,
        [greetingId, teacherUserId]
    );

    return result.rows.length > 0;

}

/**
 * React to multiple greetings at once - lets a teacher clear a
 * whole class in one action instead of one avatar at a time.
 */
async function bulkReactToGreetings(greetingIds, reaction) {

    const result = await db.query(
        `
        UPDATE morning_greetings
        SET teacher_reaction = $1
        WHERE id = ANY($2::int[])
        RETURNING *;
        `,
        [reaction, greetingIds]
    );

    return result.rows;

}

module.exports = {

    submitGreeting,

    getTodaysGreeting,

    getTodaysGreetingsForClassTeacher,

    reactToGreeting,

    bulkReactToGreetings,

    teacherOwnsGreeting

};
