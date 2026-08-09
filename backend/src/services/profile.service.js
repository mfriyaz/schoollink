const bcrypt = require("bcrypt");

const userModel = require("../models/user.model");

/**
 * Get Profile
 */
async function getProfile(userId) {

    const user = await userModel.findUserById(userId);

    if (!user) {

        return null;

    }

    return {

        id: user.id,

        full_name: user.full_name,

        email: user.email,

        mobile: user.mobile,

        role: user.role_name,

        school: user.school_name,

        created_at: user.created_at

    };

}

/**
 * Update Profile
 * (only full_name and mobile are self-editable)
 */
async function updateProfile(userId, data) {

    return await userModel.updateUserProfile(userId, data);

}

/**
 * Change Password
 */
async function changePassword(userId, currentPassword, newPassword) {

    const user = await userModel.findUserById(userId);

    if (!user) {

        throw new Error("User not found");

    }

    const currentMatches = await bcrypt.compare(
        currentPassword,
        user.password_hash
    );

    if (!currentMatches) {

        throw new Error("Current password is incorrect");

    }

    const newHash = await bcrypt.hash(newPassword, 10);

    await userModel.updateUserPassword(userId, newHash);

    return true;

}

module.exports = {

    getProfile,

    updateProfile,

    changePassword

};
