const pool = require("../config/database");

class TransferError extends Error {
    constructor(message, status) {
        super(message);
        this.status = status;
    }
}

/**
 * Hand an existing assignment (subject + class + section) over to another
 * teacher. The assignment row itself is kept, so attendance, homework and
 * marks recorded against it stay intact and simply belong to the new teacher.
 */
async function transferAssignment(schoolId, assignmentId, newTeacherId) {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const found = await client.query(
            `SELECT id, teacher_id, subject_id, class_id, section_id, academic_year_id
               FROM teacher_subjects
              WHERE id = $1 AND school_id = $2
              FOR UPDATE`,
            [assignmentId, schoolId]
        );

        const row = found.rows[0];

        if (!row) throw new TransferError("Assignment not found.", 404);

        if (row.teacher_id === newTeacherId) {
            throw new TransferError("This assignment already belongs to that teacher.", 400);
        }

        const teacher = await client.query(
            "SELECT id, first_name, last_name FROM teachers WHERE id = $1 AND school_id = $2",
            [newTeacherId, schoolId]
        );

        if (!teacher.rows[0]) throw new TransferError("Teacher not found.", 404);

        const dup = await client.query(
            `SELECT 1 FROM teacher_subjects
              WHERE teacher_id = $1 AND subject_id = $2 AND class_id = $3
                AND section_id = $4 AND academic_year_id = $5`,
            [newTeacherId, row.subject_id, row.class_id, row.section_id, row.academic_year_id]
        );

        if (dup.rows.length > 0) {
            throw new TransferError("That teacher already has this subject, class and section.", 409);
        }

        const updated = await client.query(
            `UPDATE teacher_subjects
                SET teacher_id = $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2
          RETURNING id, teacher_id, class_id, section_id, subject_id, is_class_teacher`,
            [newTeacherId, row.id]
        );

        await client.query("COMMIT");

        return { ...updated.rows[0], teacher_name: `${teacher.rows[0].first_name} ${teacher.rows[0].last_name || ""}`.trim() };

    } catch (err) {

        try { await client.query("ROLLBACK"); } catch (e) { /* ignore */ }
        throw err;

    } finally {

        client.release();

    }
}

module.exports = { transferAssignment, TransferError };
