const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const controller = require("../controllers/ai.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const writers = [authenticate, authorizeRoles("School Admin", "Teacher")];

router.get("/status", ...writers, controller.status);
router.post("/improve", ...writers, controller.improve);
router.post("/translate", ...writers, controller.translate);
router.post("/report-remarks", ...writers, tenant.body("student", "student_id"), tenant.body("exam", "exam_id"), controller.reportRemarks);

router.get("/weekly-summary/:studentId", authenticate, authorizeRoles("Parent"), tenant.param("student", "studentId"), controller.weeklySummary);
router.get("/early-warning", authenticate, authorizeRoles("School Admin"), controller.earlyWarning);
router.post("/early-warning-note", authenticate, authorizeRoles("School Admin"), tenant.body("student", "student_id"), controller.earlyWarningNote);

router.patch("/assignments/:id/class-teacher", authenticate, authorizeRoles("School Admin"), tenant.param("teacher_subject"), controller.setClassTeacher);
router.patch("/assignments/:id/transfer", authenticate, authorizeRoles("School Admin"), tenant.param("teacher_subject"), tenant.body("teacher", "teacher_id"), controller.transferAssignment);

module.exports = router;
