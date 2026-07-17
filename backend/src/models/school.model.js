const pool = require("../config/database");

/**
 * Create a new school
 */
async function createSchool(data, db = pool) {

    const query = `
        INSERT INTO schools
        (
            school_name,
            school_code,
            email,
            phone,
            website,
            address,
            city,
            state,
            country,
            postal_code,
            subscription_plan,
            status
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        )
        RETURNING *;
    `;

    const values = [
        data.school_name,
        data.school_code,
        data.email,
        data.phone,
        data.website,
        data.address,
        data.city,
        data.state,
        data.country,
        data.postal_code,
        data.subscription_plan,
        data.status
    ];

    const result = await db.query(query, values);

    return result.rows[0];
}
/**
 * Get all schools
 */
async function getAllSchools() {

    const query = `
        SELECT *
        FROM schools
        WHERE is_active = true
        ORDER BY id;
    `;

    const result = await pool.query(query);

    return result.rows;
}

/**
 * Get school by ID
 */
async function getSchoolById(id) {

    const query = `
        SELECT *
        FROM schools
        WHERE id = $1
        LIMIT 1;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
}

/**
 * Update school
 */
async function updateSchool(id, data) {

    const query = `
        UPDATE schools
        SET
            school_name = $1,
            email = $2,
            phone = $3,
            website = $4,
            address = $5,
            city = $6,
            state = $7,
            country = $8,
            postal_code = $9,
            subscription_plan = $10,
            status = $11,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $12
        RETURNING *;
    `;

    const values = [
        data.school_name,
        data.email,
        data.phone,
        data.website,
        data.address,
        data.city,
        data.state,
        data.country,
        data.postal_code,
        data.subscription_plan,
        data.status,
        id
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}

/**
 * Soft delete school
 */
async function deleteSchool(id) {

    const query = `
        UPDATE schools
        SET
            is_active = false,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *;
    `;

    const result = await pool.query(query, [id]);

    return result.rows[0];
}

async function findSchoolByCode(code) {

    const query = `
        SELECT *
        FROM schools
        WHERE school_code=$1
        LIMIT 1;
    `;

    const result = await pool.query(query,[code]);

    return result.rows[0];

}

module.exports = {
    createSchool,
    getAllSchools,
    getSchoolById,
    updateSchool,
    deleteSchool,
    findSchoolByCode
};