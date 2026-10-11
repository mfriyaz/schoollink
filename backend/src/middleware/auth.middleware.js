const jwt = require("jsonwebtoken");

const { isSchoolBlocked, BLOCKED_MESSAGE } = require("../utils/schoolAccess");

/**
 * JWT Authentication Middleware
 */
async function authenticate(req, res, next) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            success: false,
            message: "Access token is missing"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }

    try {

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.user = decoded;

    } catch (err) {

        return res.status(401).json({
            success: false,
            message: "Token is invalid or expired"
        });

    }

    // Suspended / expired schools are locked out immediately,
    // even if someone is still holding a valid login token.
    // (Super Admin has no school and is never blocked.)
    if (req.user.role !== "Super Admin" && await isSchoolBlocked(req.user.school_id)) {

        return res.status(403).json({
            success: false,
            code: "SCHOOL_SUSPENDED",
            message: BLOCKED_MESSAGE
        });

    }

    next();

}

module.exports = {
    authenticate
};