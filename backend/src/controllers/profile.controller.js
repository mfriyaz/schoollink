const profileService = require("../services/profile.service");
const response = require("../utils/response");

/**
 * Get Logged-in User Profile
 */
async function getProfile(req, res) {

    try {

        const profile = await profileService.getProfile(req.user.id);

        if (!profile) {

            return response.error(res, "Profile not found", 404);

        }

        return response.success(
            res,
            profile,
            "Profile retrieved successfully"
        );

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

/**
 * Update Logged-in User Profile
 */
async function updateProfile(req, res) {

    try {

        const { full_name, mobile } = req.body;

        if (!full_name) {

            return response.error(res, "Full name is required", 400);

        }

        const updated = await profileService.updateProfile(
            req.user.id,
            { full_name, mobile }
        );

        return response.success(
            res,
            updated,
            "Profile updated successfully"
        );

    } catch (err) {

        return response.error(res, err.message, 500);

    }

}

/**
 * Change Password
 */
async function changePassword(req, res) {

    try {

        const { current_password, new_password } = req.body;

        if (!current_password || !new_password) {

            return response.error(
                res,
                "Current password and new password are required",
                400
            );

        }

        if (new_password.length < 6) {

            return response.error(
                res,
                "New password must be at least 6 characters",
                400
            );

        }

        await profileService.changePassword(
            req.user.id,
            current_password,
            new_password
        );

        return response.success(
            res,
            null,
            "Password changed successfully"
        );

    } catch (err) {

        return response.error(res, err.message, 400);

    }

}

module.exports = {

    getProfile,

    updateProfile,

    changePassword

};
