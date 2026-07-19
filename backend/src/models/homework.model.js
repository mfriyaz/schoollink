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
            attachment_url
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6
        )
        RETURNING *;
    `;

    const values = [

        data.teacher_subject_id,
        data.title,
        data.description || null,
        data.homework_date,
        data.due_date,
        data.attachment_url || null

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
            updated_at = NOW()
        WHERE id = $6
        RETURNING *;
    `;

    const values = [

        data.title,
        data.description || null,
        data.homework_date,
        data.due_date,
        data.attachment_url || null,
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

    getHomeworkById,

    updateHomework,

    deleteHomework

};