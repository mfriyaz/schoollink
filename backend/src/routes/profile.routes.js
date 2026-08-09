const express = require("express");

const router = express.Router();

const profileController = require("../controllers/profile.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

/**
 * Get Logged-in User Profile
 */
router.get(
    "/me",
    authenticate,
    profileController.getProfile
);

/**
 * Update Logged-in User Profile
 */
router.patch(
    "/me",
    authenticate,
    profileController.updateProfile
);

/**
 * Change Password
 */
router.post(
    "/change-password",
    authenticate,
    profileController.changePassword
);

module.exports = router;
