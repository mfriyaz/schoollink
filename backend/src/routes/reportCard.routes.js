const express = require("express");

const router = express.Router();

const reportCardController = require("../controllers/reportCard.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Get Student Report Card
 */
router.get(
    "/student/:studentId/exam/:examId",
    authenticate,
    authorizeRoles(
        "School Admin",
        "Teacher",
        "Parent"
    ),
    reportCardController.getStudentReportCard
);

module.exports = router;