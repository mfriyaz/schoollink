const express = require("express");

const tenant = require("../middleware/tenantGuard");

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
    tenant.param("student", "studentId"),
    tenant.param("exam", "examId"),
    reportCardController.getStudentReportCard
);

/**
 * Report card remarks
 */
router.put(
    "/student/:studentId/exam/:examId/remarks",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("student", "studentId"),
    tenant.param("exam", "examId"),
    remarksController.saveRemarks
);

router.get(
    "/student/:studentId/remarks",
    authenticate,
    authorizeRoles("School Admin", "Teacher", "Parent"),
    tenant.param("student", "studentId"),
    remarksController.listStudentRemarks
);

module.exports = router;