const db = require("../config/database");

/**
 * Submit (or resubmit) up to 5 photos of completed homework.
 * Upserts on (homework_id, student_id) so re-uploading
 * replaces the previous set of photos rather than duplicating.
 */
async function submitHomework(data) {

    const query = `
        INSERT INTO homework_submissions
        (homework_id, student_id, parent_user_id, photo_urls, remarks)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (homework_id, student_id)
        DO UPDATE SET
            photo_urls = EXCLUDED.photo_urls,
            remarks = EXCLUDED.remarks,
            parent_user_id = EXCLUDED.parent_user_id,
            submitted_at = CURRENT_TIMESTAMP
        RETURNING *;
    `;

    const values = [
        data.homework_id,
        data.student_id,
        data.parent_user_id,
        data.photo_urls,
        data.remarks || null
    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get a specific student's submission for a homework post
 * (used by the Parent's View Post screen to show what was
 * already submitted, if anything).
 */
async function getSubmission(homeworkId, studentId) {

    const result = await db.query(
        `
        SELECT * FROM homework_submissions
        WHERE homework_id = $1 AND student_id = $2
        `,
        [homeworkId, studentId]
    );

    return result.rows[0];

}

/**
 * Get every submission for a homework post (Teacher's view),
 * joined with student names.
 */
async function getSubmissionsByHomework(homeworkId) {

    const result = await db.query(
        `
        SELECT
            hs.*,
            st.first_name,
            st.last_name,
            st.admission_no
        FROM homework_submissions hs
        JOIN students st ON hs.student_id = st.id
        WHERE hs.homework_id = $1
        ORDER BY hs.submitted_at DESC
        `,
        [homeworkId]
    );

    return result.rows;

}

/**
 * Get just the submission count for a homework post - a
 * lightweight query for list views that only need the number,
 * not every photo.
 */
async function getSubmissionCount(homeworkId) {

    const result = await db.query(
        `SELECT COUNT(*) FROM homework_submissions WHERE homework_id = $1`,
        [homeworkId]
    );

    return Number(result.rows[0].count);

}

/**
 * Teacher reacts to (and marks reviewed) a submission.
 */
async function reactToSubmission(submissionId, reaction, reviewedBy) {

    const result = await db.query(
        `
        UPDATE homework_submissions
        SET reaction = $1, reviewed_at = CURRENT_TIMESTAMP, reviewed_by = $2
        WHERE id = $3
        RETURNING *;
        `,
        [reaction, reviewedBy, submissionId]
    );

    return result.rows[0];

}

/**
 * Get a single submission by its own ID, with enough context
 * (student name, homework title, parent) to build a
 * notification when a teacher reacts to it.
 */
async function getSubmissionById(submissionId) {

    const result = await db.query(
        `
        SELECT
            hs.*,
            st.first_name AS student_first_name,
            hw.title AS homework_title
        FROM homework_submissions hs
        JOIN students st ON hs.student_id = st.id
        JOIN homework hw ON hs.homework_id = hw.id
        WHERE hs.id = $1
        `,
        [submissionId]
    );

    return result.rows[0];

}

module.exports = {

    submitHomework,

    getSubmission,

    getSubmissionsByHomework,

    getSubmissionCount,

    reactToSubmission,

    getSubmissionById

};
