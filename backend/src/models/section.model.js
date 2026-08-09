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
 * Get Sections By Class - scoped to one school, active only
 * (used by pickers, e.g. the Student form)
 */
async function getSectionsByClass(classId, schoolId) {

    const query = `
        SELECT *
        FROM sections
        WHERE class_id = $1 AND school_id = $2 AND is_active = true
        ORDER BY section_name;
    `;

    const result = await pool.query(query, [classId, schoolId]);

    return result.rows;

}

/**
 * Get All Sections For Class (including inactive) - for the
 * Classes management page
 */
async function getAllSectionsForClass(classId, schoolId) {

    const query = `
        SELECT *
        FROM sections
        WHERE class_id = $1 AND school_id = $2
        ORDER BY section_name;
    `;

    const result = await pool.query(query, [classId, schoolId]);

    return result.rows;

}

/**
 * Get Section By ID - scoped to one school
 */
async function getSectionById(id, schoolId) {

    const result = await pool.query(

        `
        SELECT *
        FROM sections
        WHERE id = $1 AND school_id = $2
        `,
        [id, schoolId]

    );

    return result.rows[0];

}

/**
 * Update Section - scoped to one school
 */
async function updateSection(id, schoolId, section) {

    const query = `
        UPDATE sections
        SET

            section_name=$1,

            class_teacher_id=$2,

            capacity=$3,

            updated_at=NOW()

        WHERE id=$4 AND school_id=$5

        RETURNING *;
    `;

    const values = [

        section.section_name,

        section.class_teacher_id,

        section.capacity,

        id,

        schoolId

    ];

    const result = await pool.query(query, values);

    return result.rows[0];

}

/**
 * Deactivate Section (soft delete)
 */
async function deactivateSection(id, schoolId) {

    const result = await pool.query(

        `
        UPDATE sections
        SET is_active = false, updated_at = NOW()
        WHERE id = $1 AND school_id = $2
        RETURNING *;
        `,
        [id, schoolId]

    );

    return result.rows[0];

}

/**
 * Reactivate Section
 */
async function reactivateSection(id, schoolId) {

    const result = await pool.query(

        `
        UPDATE sections
        SET is_active = true, updated_at = NOW()
        WHERE id = $1 AND school_id = $2
        RETURNING *;
        `,
        [id, schoolId]

    );

    return result.rows[0];

}

module.exports = {

    createSection,

    getSectionsByClass,

    getAllSectionsForClass,

    getSectionById,

    updateSection,

    deactivateSection,

    reactivateSection

};
