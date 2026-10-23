const db = require("../config/database");

/**
 * Practice quiz data. Correct answers live only in quiz_questions and are
 * read by the teacher routes and by the marking code, never by a query that
 * feeds the parent's question list.
 */

async function featureOn(schoolId) {

    try {

        const r = await db.query("SELECT ai_features FROM schools WHERE id = $1", [schoolId]);

        const f = r.rows[0] && r.rows[0].ai_features;

        return !(f && typeof f === "object" && f.quiz === false);

    } catch (e) {

        return true;

    }

}

async function getQuizByHomework(homeworkId) {

    const r = await db.query("SELECT * FROM quizzes WHERE homework_id = $1", [homeworkId]);

    return r.rows[0] || null;

}

/** Questions WITH correct answers (teacher side and marking only) */
async function getQuestionsWithAnswers(quizId) {

    const r = await db.query(
        `SELECT id, position, qtype, question_text, options, correct_index, accepted_answers, explanation
           FROM quiz_questions WHERE quiz_id = $1 ORDER BY position`,
        [quizId]
    );

    return r.rows;

}

/** Questions WITHOUT correct answers (what a parent's browser receives) */
async function getQuestionsForTaking(quizId) {

    const r = await db.query(
        `SELECT id, position, qtype, question_text, options
           FROM quiz_questions WHERE quiz_id = $1 ORDER BY position`,
        [quizId]
    );

    return r.rows;

}

async function countAttempts(quizId) {

    const r = await db.query("SELECT COUNT(*)::int AS n FROM quiz_attempts WHERE quiz_id = $1", [quizId]);

    return r.rows[0].n;

}

async function replaceQuiz(homeworkId, maxAttempts, questions) {

    const client = await db.connect();

    try {

        await client.query("BEGIN");

        await client.query("DELETE FROM quizzes WHERE homework_id = $1", [homeworkId]);

        const q = await client.query(
            "INSERT INTO quizzes (homework_id, max_attempts) VALUES ($1, $2) RETURNING *",
            [homeworkId, maxAttempts]
        );

        const quiz = q.rows[0];

        for (let i = 0; i < questions.length; i++) {

            const x = questions[i];

            await client.query(
                `INSERT INTO quiz_questions (quiz_id, position, qtype, question_text, options, correct_index, accepted_answers, explanation)
                 VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7::jsonb, $8)`,
                [quiz.id, i + 1, x.qtype, x.question_text, JSON.stringify(x.options), x.correct_index,
                    x.accepted_answers ? JSON.stringify(x.accepted_answers) : null, x.explanation || null]
            );

        }

        await client.query("COMMIT");

        return quiz;

    } catch (err) {

        try { await client.query("ROLLBACK"); } catch (e) { /* ignore */ }

        throw err;

    } finally {

        client.release();

    }

}

async function deleteQuiz(homeworkId) {

    await db.query("DELETE FROM quizzes WHERE homework_id = $1", [homeworkId]);

}

/** Open / late judged in the school's own time zone (same rule as homework submissions) */
async function getHomeworkRules(homeworkId) {

    const r = await db.query(
        `
        SELECT
            (NOT hw.submissions_closed AND (hw.submissions_close_date IS NULL OR hw.submissions_close_date >= (NOW() AT TIME ZONE COALESCE(sch.timezone, 'Asia/Singapore'))::date)) AS open,
            (hw.due_date IS NOT NULL AND hw.due_date < (NOW() AT TIME ZONE COALESCE(sch.timezone, 'Asia/Singapore'))::date) AS past_due
        FROM homework hw
        JOIN teacher_subjects ts ON ts.id = hw.teacher_subject_id
        JOIN schools sch ON sch.id = ts.school_id
        WHERE hw.id = $1
        `,
        [homeworkId]
    );

    return r.rows[0] || null;

}

/** The parent owns this child AND the child is in the class this homework was posted to */
async function parentChildInHomework(userId, studentId, homeworkId) {

    const r = await db.query(
        `
        SELECT 1
        FROM homework hw
        JOIN teacher_subjects ts ON ts.id = hw.teacher_subject_id
        JOIN students st ON st.class_id = ts.class_id AND st.section_id = ts.section_id
        JOIN parent_students ps ON ps.student_id = st.id
        WHERE hw.id = $1 AND st.id = $2 AND ps.parent_user_id = $3
        `,
        [homeworkId, studentId, userId]
    );

    return r.rows.length > 0;

}

async function getAttempts(quizId, studentId) {

    const r = await db.query(
        `SELECT id, answers, score, total, is_late, submitted_at
           FROM quiz_attempts WHERE quiz_id = $1 AND student_id = $2
          ORDER BY id`,
        [quizId, studentId]
    );

    return r.rows;

}

/**
 * Save one attempt, but only if the child still has attempts left.
 * The quiz row is locked while we count, so two taps at once can't squeeze in an extra attempt.
 */
async function saveAttempt(quiz, studentId, parentUserId, answers, score, total, isLate) {

    const client = await db.connect();

    try {

        await client.query("BEGIN");

        await client.query("SELECT id FROM quizzes WHERE id = $1 FOR UPDATE", [quiz.id]);

        const c = await client.query(
            "SELECT COUNT(*)::int AS n FROM quiz_attempts WHERE quiz_id = $1 AND student_id = $2",
            [quiz.id, studentId]
        );

        if (c.rows[0].n >= quiz.max_attempts) {

            await client.query("ROLLBACK");

            return null;

        }

        const r = await client.query(
            `INSERT INTO quiz_attempts (quiz_id, student_id, parent_user_id, answers, score, total, is_late)
             VALUES ($1, $2, $3, $4::jsonb, $5, $6, $7)
             RETURNING id, answers, score, total, is_late, submitted_at`,
            [quiz.id, studentId, parentUserId, JSON.stringify(answers), score, total, isLate]
        );

        await client.query("COMMIT");

        return r.rows[0];

    } catch (err) {

        try { await client.query("ROLLBACK"); } catch (e) { /* ignore */ }

        throw err;

    } finally {

        client.release();

    }

}

/**
 * Class results for the teacher: every child in the homework's class/section with
 * their tries and best score, plus how many got each question right on their FIRST try.
 */
async function getResults(homeworkId, quizId) {

    const kids = await db.query(
        `
        SELECT st.id, st.first_name, st.last_name, st.admission_no
        FROM homework hw
        JOIN teacher_subjects ts ON ts.id = hw.teacher_subject_id
        JOIN students st ON st.class_id = ts.class_id AND st.section_id = ts.section_id
        WHERE hw.id = $1 AND COALESCE(st.is_active, true) = true
        ORDER BY st.first_name, st.last_name
        `,
        [homeworkId]
    );

    const att = await db.query(
        `SELECT id, student_id, answers, score, total, is_late, submitted_at
           FROM quiz_attempts WHERE quiz_id = $1 ORDER BY id`,
        [quizId]
    );

    return { students: kids.rows, attempts: att.rows };

}

module.exports = {
    getResults,
    featureOn,
    getQuizByHomework,
    getQuestionsWithAnswers,
    getQuestionsForTaking,
    countAttempts,
    replaceQuiz,
    deleteQuiz,
    getHomeworkRules,
    parentChildInHomework,
    getAttempts,
    saveAttempt
};
