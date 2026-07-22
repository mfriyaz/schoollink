const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

async function reset() {

    const hash = await bcrypt.hash("Admin@123", 10);

    await pool.query(
        `
        UPDATE users
        SET password_hash = $1
        WHERE email = 'admin@fousiyya.edu'
        `,
        [hash]
    );

    console.log("Admin password reset successfully.");
    console.log("Password : Admin@123");

    process.exit();
}

reset();