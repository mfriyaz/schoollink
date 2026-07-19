const pool = require("../config/database");

/**
 * Create Section
 */
async function createSection(section) {

    const query = `
        INSERT INTO sections
        (
            school_id,
            class_id,
            section_name,
            class_teacher_id,
            capacity
        )
        VALUES
        ($1,$2,$3,$4,$5)
        RETURNING *;
    `;

    const values = [

        section.school_id,

        section.class_id,

        section.section_name,

        section.class_teacher_id || null,

        section.capacity || 40

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/**
 * Get Sections By Class
 */
async function getSectionsByClass(classId) {

    const query = `
        SELECT *
        FROM sections
        WHERE class_id=$1
        ORDER BY section_name;
    `;

    const result = await pool.query(query, [classId]);

    return result.rows;

}

/**
 * Get Section By ID
 */
async function getSectionById(id) {

    const result = await pool.query(

        `
        SELECT *
        FROM sections
        WHERE id=$1
        `,
        [id]

    );

    return result.rows[0];

}

/**
 * Update Section
 */
async function updateSection(id, section) {

    const query = `
        UPDATE sections
        SET

            section_name=$1,

            class_teacher_id=$2,

            capacity=$3,

            is_active=$4,

            updated_at=NOW()

        WHERE id=$5

        RETURNING *;
    `;

    const values = [

        section.section_name,

        section.class_teacher_id,

        section.capacity,

        section.is_active,

        id

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/**
 * Delete Section
 */
async function deleteSection(id) {

    const result = await pool.query(

        `
        DELETE FROM sections
        WHERE id=$1
        RETURNING *;
        `,
        [id]

    );

    return result.rows[0];

}

module.exports = {

    createSection,

    getSectionsByClass,

    getSectionById,

    updateSection,

    deleteSection

};