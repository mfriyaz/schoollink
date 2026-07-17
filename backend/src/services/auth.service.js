const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");

async function login(email, password) {

    // Find user by email
    const user = await userModel.findUserByEmail(email);

    console.log("========== LOGIN DEBUG ==========");
    console.log("User:", user);

    if (!user) {
        throw new Error("Invalid email or password");
    }

    // Check account status
    if (!user.is_active) {
        throw new Error("Account is disabled");
    }

    console.log("Entered Password:", password);
    console.log("Stored Hash:", user.password_hash);

    // Verify password
    const passwordMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    console.log("Password Match:", passwordMatch);
    console.log("===============================");

    if (!passwordMatch) {
        throw new Error("Invalid email or password");
    }

    // Generate JWT Token
    const token = jwt.sign(
        {
            id: user.id,
            school_id: user.school_id,
            role: user.role_name
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "8h"
        }
    );

    return {
        token,
        user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role_name,
            school: user.school_name
        }
    };
}

module.exports = {
    login
};