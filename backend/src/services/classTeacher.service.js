const pool = require("../config/database");

/**
 * Make (or stop being) the class teacher of a section, for an assignment
 * that already exists. Only one assignment per section carries the flag.
 * Returns null when the assignment is not found in this school.
 */
async function setClassTeacher(schoolId, assignmentId, value) {

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const found = await client.query(
            `SELECT id, class_id, section_id, academic_year_id
               FROM teacher_subjects
              WHERE id = $1 AND school_id = $2
              FOR UPDATE`,
            [assignmentId, schoolId]
        );

        const row = found.rows[0];

        if (!row) {
            await client.query("ROLLBACK");
            return null;
        }

        if (value) {
            // one class teacher per section: clear the flag on the others first
            await client.query(
                `UPDATE teacher_subjects
                    SET is_class_teacher = false, updated_at = CURRENT_TIMESTAMP
                  WHERE school_id = $1 AND class_id = $2 AND section_id = $3
                    AND academic_year_id = $4 AND id <> $5 AND is_class_teacher = true`,
                [schoolId, row.class_id, row.section_id, row.academic_year_id, row.id]
            );
        }

        const updated = await client.query(
            `UPDATE teacher_subjects
                SET is_class_teacher = $1, updated_at = CURRENT_TIMESTAMP
              WHERE id = $2
          RETURNING id, teacher_id, class_id, section_id, is_class_teacher`,
            [!!value, row.id]
        );

        await client.query("COMMIT");

        return updated.rows[0];

    } catch (err) {

        try { await client.query("ROLLBACK"); } catch (e) { /* ignore */ }
        throw err;

    } finally {

        client.release();

    }
}

module.exports = { setClassTeacher };
