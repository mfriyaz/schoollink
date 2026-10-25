const db = require("../config/database");

/**
 * Create Homework
 */
async function createHomework(data) {

    const query = `
        INSERT INTO homework
        (
            teacher_subject_id,
            title,
            description,
            homework_date,
            due_date,
            attachment_url,
            priority,
            require_acknowledgement,
            voice_note_url,
            image_urls,
            allow_photo_submission,
            allow_voice_submission,
            allow_view_all_submissions,
            submissions_close_date
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,
            COALESCE($14::date, $5::date + 3)
        )
        RETURNING *;
    `;

    const values = [

        data.teacher_subject_id,
        data.title,
        data.description || null,
        data.homework_date,
        data.due_date,
        data.attachment_url || null,
        data.priority || "Normal",
        data.require_acknowledgement !== undefined ? data.require_acknowledgement : true,
        data.voice_note_url || null,
        data.image_urls && data.image_urls.length > 0 ? data.image_urls : null,
        data.allow_photo_submission !== undefined ? data.allow_photo_submission : true,
        data.allow_voice_submission !== undefined ? data.allow_voice_submission : false,
        data.allow_view_all_submissions !== undefined ? data.allow_view_all_submissions : false,
        data.submissions_close_date || null

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get Homework By Teacher Subject
 */
async function getHomeworkByTeacherSubject(teacherSubjectId) {

    const query = `
        SELECT
            hw.*,
            (SELECT COUNT(*)::int FROM quiz_questions qq JOIN quizzes q ON q.id = qq.quiz_id WHERE q.homework_id = hw.id) AS quiz_questions,
            (SELECT q.closed FROM quizzes q WHERE q.homework_id = hw.id) AS quiz_closed,
            (SELECT COUNT(*)::int FROM quiz_attempts a JOIN quizzes q ON q.id = a.quiz_id WHERE q.homework_id = hw.id) AS quiz_attempts
        FROM homework hw
        WHERE hw.teacher_subject_id = $1
        ORDER BY hw.homework_date DESC;
    `;

    const result = await db.query(query, [teacherSubjectId]);

    return result.rows;

}

/**
 * Get Homework For Student
 * (Parent's feed: every homework posted to this student's
 * class/section, with whether THEY have acknowledged it yet)
 */
async function getHomeworkForStudent(studentId) {

    const query = `
        SELECT
            hw.*,
            s.subject_name,
            t.first_name AS teacher_first_name,
            t.last_name AS teacher_last_name,
            c.class_name,
            sec.section_name,
            COALESCE(a.is_acknowledged, false) AS is_acknowledged,
            a.acknowledged_at,
            a.remarks,
            (SELECT COUNT(*)::int FROM quiz_questions qq JOIN quizzes q ON q.id = qq.quiz_id WHERE q.homework_id = hw.id) AS quiz_questions,
            (SELECT q.closed FROM quizzes q WHERE q.homework_id = hw.id) AS quiz_closed,
            (SELECT q.max_attempts FROM quizzes q WHERE q.homework_id = hw.id) AS quiz_max_attempts,
            (SELECT COUNT(*)::int FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id WHERE q.homework_id = hw.id AND qa.student_id = st.id) AS quiz_tries,
            (SELECT qa.score FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id WHERE q.homework_id = hw.id AND qa.student_id = st.id ORDER BY qa.score DESC, qa.id LIMIT 1) AS quiz_best_score,
            (SELECT qa.total FROM quiz_attempts qa JOIN quizzes q ON q.id = qa.quiz_id WHERE q.homework_id = hw.id AND qa.student_id = st.id ORDER BY qa.score DESC, qa.id LIMIT 1) AS quiz_best_total,
            (NOT hw.submissions_closed AND (hw.submissions_close_date IS NULL OR hw.submissions_close_date >= (NOW() AT TIME ZONE COALESCE(sch.timezone, 'Asia/Singapore'))::date)) AS submissions_open,
            (hw.due_date IS NOT NULL AND hw.due_date < (NOW() AT TIME ZONE COALESCE(sch.timezone, 'Asia/Singapore'))::date) AS past_due
        FROM homework hw
        JOIN teacher_subjects ts
            ON hw.teacher_subject_id = ts.id
        JOIN schools sch
            ON sch.id = ts.school_id
        JOIN subjects s
            ON ts.subject_id = s.id
        JOIN teachers t
            ON ts.teacher_id = t.id
        JOIN classes c
            ON ts.class_id = c.id
        JOIN sections sec
            ON ts.section_id = sec.id
        JOIN students st
            ON st.class_id = ts.class_id
            AND st.section_id = ts.section_id
        LEFT JOIN acknowledgements a
            ON a.post_type = 'homework'
            AND a.post_id = hw.id
            AND a.student_id = st.id
        WHERE st.id = $1
        ORDER BY hw.created_at DESC;
    `;

    const result = await db.query(query, [studentId]);

    return result.rows;

}

/**
 * Get Homework By ID
 */
async function getHomeworkById(id) {

    const result = await db.query(
        `
        SELECT *
        FROM homework
        WHERE id = $1
        `,
        [id]
    );

    return result.rows[0];

}

/**
 * Get Homework By ID, scoped to a school - prevents one
 * school's Admin/Teacher from viewing or editing another
 * school's post just by guessing/incrementing an ID.
 */
async function getHomeworkByIdForSchool(id, schoolId) {

    const result = await db.query(
        `
        SELECT hw.*, ts.teacher_id, ts.school_id
        FROM homework hw
        JOIN teacher_subjects ts ON hw.teacher_subject_id = ts.id
        WHERE hw.id = $1 AND ts.school_id = $2
        `,
        [id, schoolId]
    );

    return result.rows[0];

}

/**
 * Update Homework
 */
async function updateHomework(id, data) {

    const query = `
        UPDATE homework
        SET
            title = $1,
            description = $2,
            homework_date = $3,
            due_date = $4,
            attachment_url = $5,
            image_urls = $6,
            allow_photo_submission = COALESCE($7, allow_photo_submission),
            allow_voice_submission = COALESCE($8, allow_voice_submission),
            allow_view_all_submissions = COALESCE($9, allow_view_all_submissions),
            submissions_close_date = COALESCE($10::date, submissions_close_date),
            updated_at = NOW()
        WHERE id = $11
        RETURNING *;
    `;

    const values = [

        data.title,
        data.description || null,
        data.homework_date,
        data.due_date,
        data.attachment_url || null,
        data.image_urls && data.image_urls.length > 0 ? data.image_urls : null,
        data.allow_photo_submission !== undefined ? data.allow_photo_submission : null,
        data.allow_voice_submission !== undefined ? data.allow_voice_submission : null,
        data.allow_view_all_submissions !== undefined ? data.allow_view_all_submissions : null,
        data.submissions_close_date || null,
        id

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Close submissions now, or reopen them.
 * Reopening gives everyone 3 more days (counted in the school's own time).
 */
async function setSubmissionsClosed(id, closed) {

    const result = await db.query(
        `
        UPDATE homework hw
        SET
            submissions_closed = $2,
            submissions_close_date = CASE
                WHEN $2 THEN hw.submissions_close_date
                ELSE (
                    NOW() AT TIME ZONE COALESCE(
                        (SELECT sch.timezone FROM teacher_subjects ts
                         JOIN schools sch ON sch.id = ts.school_id
                         WHERE ts.id = hw.teacher_subject_id),
                        'Asia/Singapore'
                    )
                )::date + 3
            END,
            updated_at = NOW()
        WHERE hw.id = $1
        RETURNING *;
        `,
        [id, closed]
    );

    return result.rows[0];

}

/**
 * Teacher-only answer key (separate table: never joined into parent queries)
 */
async function getAnswerKey(homeworkId) {

    const result = await db.query(
        `SELECT answer_key, ai_generated, updated_at FROM homework_answer_keys WHERE homework_id = $1`,
        [homeworkId]
    );

    return result.rows[0] || null;

}

async function saveAnswerKey(homeworkId, text, aiGenerated) {

    const result = await db.query(
        `
        INSERT INTO homework_answer_keys (homework_id, answer_key, ai_generated)
        VALUES ($1, $2, $3)
        ON CONFLICT (homework_id)
        DO UPDATE SET
            answer_key = EXCLUDED.answer_key,
            ai_generated = homework_answer_keys.ai_generated AND EXCLUDED.ai_generated,
            updated_at = NOW()
        RETURNING answer_key, ai_generated, updated_at;
        `,
        [homeworkId, text, aiGenerated]
    );

    return result.rows[0];

}

async function deleteAnswerKey(homeworkId) {

    await db.query(`DELETE FROM homework_answer_keys WHERE homework_id = $1`, [homeworkId]);

}

/**
 * Delete Homework
 */
async function deleteHomework(id) {

    const result = await db.query(
        `
        DELETE FROM homework
        WHERE id = $1
        RETURNING *;
        `,
        [id]
    );

    return result.rows[0];

}

module.exports = {

    createHomework,

    getHomeworkByTeacherSubject,

    getHomeworkForStudent,

    getHomeworkById,

    getHomeworkByIdForSchool,

    updateHomework,

    setSubmissionsClosed,

    getAnswerKey,

    saveAnswerKey,

    deleteAnswerKey,

    deleteHomework

};