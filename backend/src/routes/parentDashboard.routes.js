const express = require("express");

const router = express.Router();

const parentDashboardController = require("../controllers/parentDashboard.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Parent Dashboard
 */
router.get(
    "/:studentId",
    authenticate,
    authorizeRoles(
        "Parent",
        "School Admin",
        "Super Admin"
    ),
    parentDashboardController.getParentDashboard
);

module.exports = router;