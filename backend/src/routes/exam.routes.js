const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const examController =
    require("../controllers/exam.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create Exam
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
    examController.createExam
);

/**
 * Get All Exams
 */
router.get(
    "/",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    examController.getAllExams
);

/**
 * Get Exam By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("exam", "id"),
    examController.getExamById
);

/**
 * Update Exam
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("exam", "id"),
    examController.updateExam
);

/**
 * Archive / restore Exam (keeps marks and report cards)
 */
router.patch(
    "/:id/archived",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("exam", "id"),
    examController.setExamArchived
);

/**
 * Delete Exam
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("exam", "id"),
    examController.deleteExam
);

module.exports = router;