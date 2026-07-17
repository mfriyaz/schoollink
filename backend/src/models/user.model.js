const pool = require("../config/database");

/**
 * Find user by email
 */
async function findUserByEmail(email, db = pool) {

    const query = `
        SELECT
            u.id,
            u.school_id,
            u.role_id,
            u.full_name,
            u.email,
            u.mobile,
            u.password_hash,
            u.is_active,
            r.role_name,
            s.school_name
        FROM users u
        INNER JOIN roles r
            ON u.role_id = r.id
        LEFT JOIN schools s
            ON u.school_id = s.id
        WHERE LOWER(u.email) = LOWER($1)
        LIMIT 1;
    `;

    const result = await db.query(query, [email]);

    return result.rows[0];
}

/**
 * Check email exists
 */
async function emailExists(email) {

    const result = await pool.query(
        "SELECT id FROM users WHERE LOWER(email)=LOWER($1)",
        [email]
    );

    return result.rows.length > 0;
}

/**
 * Check mobile exists
 */
async function mobileExists(mobile) {

    const result = await pool.query(
        "SELECT id FROM users WHERE mobile=$1",
        [mobile]
    );

    return result.rows.length > 0;
}

/**
 * Create user
 */
async function createUser(data, db = pool) {

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

    const result = await db.query(query, values);

    return result.rows[0];

}

async function findUserByMobile(mobile, db = pool) {

    const query = `
        SELECT *
        FROM users
        WHERE mobile = $1
        LIMIT 1;
    `;

    const result = await db.query(query,[mobile]);

    return result.rows[0];

}


module.exports = {

    findUserByEmail,

    emailExists,

    mobileExists,

    createUser,

    findUserByMobile

};