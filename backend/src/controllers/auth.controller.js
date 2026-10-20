const authService = require("../services/auth.service");
const loginLimiter = require("../middleware/loginLimiter");

async function login(req, res) {

    try {

        const { identifier, email, password, remember } = req.body || {};

        // Accept the older "email" field name too, so any
        // client that hasn't picked up the new field yet keeps
        // working without a forced simultaneous frontend deploy.
        const loginIdentifier = identifier || email;

        if (!loginIdentifier || !password) {
            return res.status(400).json({
                success: false,
                message: "Email/username and password are required"
            });
        }

        const wait = loginLimiter.blockedMinutes(req, loginIdentifier);
        if (wait) {
            return res.status(429).json({
                success: false,
                message: `Too many wrong attempts. Please try again in ${wait} minute${wait === 1 ? "" : "s"}.`
            });
        }

        let result;
        try {
            result = await authService.login(loginIdentifier, password, remember);
        } catch (err) {
            loginLimiter.recordFailure(req, loginIdentifier);
            throw err;
        }

        loginLimiter.recordSuccess(req, loginIdentifier);

        return res.json({
            success: true,
            token: result.token,
            user: result.user
        });

    } catch (err) {

        // Never log the request body or headers here: they contain passwords.
        console.error("LOGIN ERROR:", err.message);

        return res.status(401).json({
            success: false,
            message: err.message
        });

    }
}

module.exports = {
    login
};
