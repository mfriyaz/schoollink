const pool = require("../config/database");

async function getRoleByName(roleName, db = pool) {

    const query = `
        SELECT *
        FROM roles
        WHERE role_name = $1
        LIMIT 1;
    `;

    const result = await pool.query(
        query,
        [roleName]
    );

    return result.rows[0];
}

module.exports = {
    getRoleByName
};