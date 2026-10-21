const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const teacherDashboardController = require("../controllers/teacherDashboard.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Teacher Dashboard
 */
router.get(
    "/:teacherId",
    authenticate,
    authorizeRoles(
        "Teacher",
        "School Admin"
    ),
    tenant.param("teacher", "teacherId"),
    tenant.teacherParam("teacher", "teacherId"),
    teacherDashboardController.getTeacherDashboard
);

module.exports = router;