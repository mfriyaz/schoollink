const authService = require("../services/auth.service");

async function login(req, res) {

    console.log("========== LOGIN REQUEST ==========");
    console.log("Headers:", req.headers);
    console.log("Body:", req.body);
    console.log("===================================");

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const result = await authService.login(email, password);

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