const db = require("../config/database");

class ExamError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

/**
 * Create Exam
 */
async function createExam(data) {

    const query = `
        INSERT INTO exams
        (
            school_id,
            academic_year_id,
            exam_name,
            start_date,
            end_date
        )
        VALUES
        (
            $1,$2,$3,$4,$5
        )
        RETURNING *;
    `;

    const values = [

        data.school_id,
        data.academic_year_id,
        data.exam_name,
        data.start_date,
        data.end_date

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get All Exams
 */
async function getAllExams(schoolId, includeArchived = false) {

    const query = `
        SELECT *
        FROM exams
        WHERE school_id = $1
        ${includeArchived ? "" : "AND is_active IS NOT FALSE"}
        ORDER BY start_date DESC;
    `;

    const result = await db.query(query, [schoolId]);

    return result.rows;

}

/**
 * Get Exam By ID
 */
async function getExamById(id, schoolId) {

    const result = await db.query(
        `
        SELECT *
        FROM exams
        WHERE id = $1
        AND school_id = $2
        `,
        [id, schoolId]
    );

    return result.rows[0];

}

/**
 * Update Exam
 */
async function updateExam(id, schoolId, data) {

    const query = `
        UPDATE exams
        SET
            exam_name = $1,
            start_date = $2,
            end_date = $3,
            updated_at = NOW()
        WHERE id = $4
        AND school_id = $5
        RETURNING *;
    `;

    const values = [

        data.exam_name,
        data.start_date,
        data.end_date,
        id,
        schoolId

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Delete Exam
 */
async function examHasMarks(id, schoolId) {

    const result = await db.query(
        `
        SELECT COUNT(*)::int AS n
        FROM student_marks sm
        JOIN exam_subjects es ON es.id = sm.exam_subject_id
        JOIN exams e ON e.id = es.exam_id
        WHERE e.id = $1 AND e.school_id = $2
        `,
        [id, schoolId]
    );

    return result.rows[0].n > 0;

}

/**
 * Delete an exam that was created by mistake.
 * Only allowed while no marks have been entered; its (empty)
 * subject list goes with it. Otherwise it must be archived.
 */
async function deleteExam(id, schoolId) {

    const client = await db.connect();

    try {

        await client.query("BEGIN");

        const found = await client.query(
            "SELECT id FROM exams WHERE id = $1 AND school_id = $2 FOR UPDATE",
            [id, schoolId]
        );

        if (!found.rows[0]) {
            await client.query("ROLLBACK");
            return null;
        }

        const marks = await client.query(
            `SELECT COUNT(*)::int AS n
               FROM student_marks sm
               JOIN exam_subjects es ON es.id = sm.exam_subject_id
              WHERE es.exam_id = $1`,
            [id]
        );

        if (marks.rows[0].n > 0) {
            throw new ExamError("This exam already has marks entered, so it can't be deleted. Archive it instead to hide it.", 409);
        }

        await client.query("DELETE FROM exam_subjects WHERE exam_id = $1", [id]);

        const deleted = await client.query(
            "DELETE FROM exams WHERE id = $1 AND school_id = $2 RETURNING *",
            [id, schoolId]
        );

        await client.query("COMMIT");

        return deleted.rows[0];

    } catch (err) {

        try { await client.query("ROLLBACK"); } catch (e) { /* ignore */ }

        if (err.code === "23503") {
            throw new ExamError("This exam is used by other records, so it can't be deleted. Archive it instead to hide it.", 409);
        }

        throw err;

    } finally {

        client.release();

    }

}

/**
 * Archive (hide) or restore an exam. Marks and report cards stay.
 */
async function setExamArchived(id, schoolId, archived) {

    const result = await db.query(
        `
        UPDATE exams
        SET is_active = $3, updated_at = NOW()
        WHERE id = $1 AND school_id = $2
        RETURNING *;
        `,
        [id, schoolId, !archived]
    );

    return result.rows[0];

}

module.exports = {

    createExam,

    getAllExams,

    getExamById,

    updateExam,

    deleteExam,

    setExamArchived,

    examHasMarks,

    ExamError

};