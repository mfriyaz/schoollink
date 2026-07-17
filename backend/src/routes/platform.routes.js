const express = require("express");

const router = express.Router();

const platformController = require("../controllers/platform.controller");

const {
    authenticateToken
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

router.post(
    "/onboard-school",
    authenticateToken,
    authorizeRoles("Super Admin"),
    platformController.onboardSchool
);

module.exports = router;