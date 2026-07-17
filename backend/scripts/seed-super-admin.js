require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("../src/config/database");

async function seedSuperAdmin() {
    try {

        const password = "SuperAdmin@2026";

        const passwordHash = await bcrypt.hash(password, 10);

        const existing = await pool.query(
            "SELECT id FROM users WHERE email = $1",
            ["superadmin@schoollink.com"]
        );

        if (existing.rows.length > 0) {

            console.log("✅ Super Administrator already exists.");

            process.exit(0);

        }

        await pool.query(

            `INSERT INTO users
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
            ($1,$2,$3,$4,$5,$6,$7)`,

            [
                1,
                1,
                "Platform Super Administrator",
                "superadmin@schoollink.com",
                "9999999999",
                passwordHash,
                true
            ]

        );

        console.log("");
        console.log("=======================================");
        console.log(" Super Administrator Created");
        console.log("=======================================");
        console.log("Email    : superadmin@schoollink.com");
        console.log("Password : SuperAdmin@2026");
        console.log("=======================================");

        process.exit(0);

    } catch (err) {

        console.error(err);

        process.exit(1);

    }
}

seedSuperAdmin();