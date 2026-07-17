const platformService = require("../services/platform.service");

async function onboardSchool(req, res) {

    try {

        const result = await platformService.onboardSchool(req.body);

        return res.status(201).json({
            success: true,
            message: "School onboarded successfully",
            data: result
        });

    } catch (err) {

        return res.status(400).json({
            success: false,
            message: err.message
        });

    }

}

module.exports = {
    onboardSchool
};