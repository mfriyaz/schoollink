const authService = require("../services/auth.service");

async function login(req, res) {

    console.log("========== LOGIN REQUEST ==========");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("===================================");

    try {

        const { identifier, email, password } = req.body;

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

        const result = await authService.login(loginIdentifier, password);

        return res.json({
            success: true,
            token: result.token,
            user: result.user
        });

    } catch (err) {

        console.error("LOGIN ERROR:", err);

        return res.status(401).json({
            success: false,
            message: err.message
        });

    }
}

module.exports = {
    login
};
