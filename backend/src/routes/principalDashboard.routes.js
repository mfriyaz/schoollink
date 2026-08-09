const express = require("express");

const router = express.Router();

const principalDashboardController = require("../controllers/principalDashboard.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Principal Dashboard
 */
router.get(
    "/",
    authenticate,
    authorizeRoles(
        "School Admin"
    ),
    principalDashboardController.getPrincipalDashboard
);

module.exports = router;