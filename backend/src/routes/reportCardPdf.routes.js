const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const reportCardPdfController = require("../controllers/reportCardPdf.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

router.get(
    "/student/:studentId/exam/:examId/pdf",
    authenticate,
    authorizeRoles(
        "School Admin",
        "Teacher",
        "Parent"
    ),
    tenant.param("student", "studentId"),
    tenant.param("exam", "examId"),
    reportCardPdfController.downloadReportCard
);

module.exports = router;