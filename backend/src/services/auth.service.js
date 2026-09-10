const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userModel = require("../models/user.model");

async function login(identifier, password) {

    // Find user by email OR username - whichever the person
    // typed. Username is unique platform-wide (not just within
    // a school), so this always resolves to at most one account
    // without needing to know which school first.
    const user = await userModel.findUserByEmailOrUsername(identifier);

    if (!user) {
        throw new Error("Invalid email/username or password");
    }

    // Check account status
    if (!user.is_active) {
        throw new Error("Account is disabled");
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(
        password,
        user.password_hash
    );

    if (!passwordMatch) {
        throw new Error("Invalid email/username or password");
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
            username: user.username,
            role: user.role_name,
            school: user.school_name,
            school_timezone: user.school_timezone || "Asia/Singapore"
        }
    };
}

module.exports = {
    login
};
