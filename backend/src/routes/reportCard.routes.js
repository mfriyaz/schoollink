const express = require("express");

const router = express.Router();

const reportCardController = require("../controllers/reportCard.controller");
const remarksController = require("../controllers/reportRemarks.controller");

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

/**
 * Report card remarks
 */
router.put(
    "/student/:studentId/exam/:examId/remarks",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    remarksController.saveRemarks
);

router.get(
    "/student/:studentId/remarks",
    authenticate,
    authorizeRoles("School Admin", "Teacher", "Parent"),
    remarksController.listStudentRemarks
);

module.exports = router;