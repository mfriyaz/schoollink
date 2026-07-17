require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

async function seedAdmin() {
    try {
        const password = "School@123";
        const passwordHash = await bcrypt.hash(password, 10);

        // Check if admin already exists
        const existing = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            ["admin@fousiyya.edu"]
        );

        if (existing.rows.length > 0) {
            console.log("✅ Administrator already exists.");
            process.exit(0);
        }

        await pool.query(
            `INSERT INTO users
            (school_id, role_id, full_name, email, mobile, password_hash, is_active)
            VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [
                1,
                2,
                "School Administrator",
                "admin@fousiyya.edu",
                "9876543210",
                passwordHash,
                true
            ]
        );

        console.log("--------------------------------");
        console.log("School Administrator Created");
        console.log("--------------------------------");
        console.log("Email    : admin@fousiyya.edu");
        console.log("Password : School@123");
        console.log("--------------------------------");

        process.exit(0);

    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

seedAdmin();