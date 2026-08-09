const settingsService = require("../services/settings.service");
const response = require("../utils/response");

async function getSettings(req, res) {

    try {

        const settings = await settingsService.getSettings(req.user.id);

        return response.success(
            res,
            settings,
            "Settings retrieved successfully"
        );

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

async function updateSettings(req, res) {

    try {

        const {
            email_notifications,
            in_app_notifications
        } = req.body;

        const settings = await settingsService.updateSettings(
            req.user.id,
            { email_notifications, in_app_notifications }
        );

        return response.success(
            res,
            settings,
            "Settings updated successfully"
        );

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

module.exports = {

    getSettings,

    updateSettings

};
