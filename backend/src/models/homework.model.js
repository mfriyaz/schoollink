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
            image_urls
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
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
        data.image_urls && data.image_urls.length > 0 ? data.image_urls : null

    ];

    const result = await db.query(query, values);

    return result.rows[0];

}

/**
 * Get Homework By Teacher Subject
 */
async function getHomeworkByTeacherSubject(teacherSubjectId) {

    const query = `
        SELECT *
        FROM homework
        WHERE teacher_subject_id = $1
        ORDER BY homework_date DESC;
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
            a.remarks
        FROM homework hw
        JOIN teacher_subjects ts
            ON hw.teacher_subject_id = ts.id
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
            updated_at = NOW()
        WHERE id = $7
        RETURNING *;
    `;

    const values = [

        data.title,
        data.description || null,
        data.homework_date,
        data.due_date,
        data.attachment_url || null,
        data.image_urls && data.image_urls.length > 0 ? data.image_urls : null,
        id

    ];

    const result = await db.query(query, values);

    return result.rows[0];

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

    deleteHomework

};