const pool = require("../config/database");

/**
 * Create School Administrator
 */
async function createAdmin(data) {

    const query = `
        INSERT INTO users
        (
            school_id,
            role_id,
            full_name,
            email,
            mobile,
            password_hash,
            is_active
        )
        VALUES
        (
            $1,$2,$3,$4,$5,$6,true
        )
        RETURNING
            id,
            school_id,
            role_id,
            full_name,
            email,
            mobile,
            is_active,
            created_at;
    `;

    const values = [
        data.school_id,
        data.role_id,
        data.full_name,
        data.email,
        data.mobile,
        data.password_hash
    ];

    const result = await pool.query(query, values);

    return result.rows[0];
}

module.exports = {
    createAdmin
};