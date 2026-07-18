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

module.exports = router;