const express = require("express");

const router = express.Router();

const platformController = require("../controllers/platform.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Platform - Onboard New School
 */
router.post(
    "/onboard-school",
    authenticate,
    authorizeRoles("Super Admin"),
    platformController.onboardSchool
);

module.exports = router;