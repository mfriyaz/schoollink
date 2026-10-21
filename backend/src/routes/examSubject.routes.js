const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const examSubjectController =
    require("../controllers/examSubject.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Assign Subject To Exam
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.body("exam", "exam_id"),
    tenant.body("teacher_subject", "teacher_subject_id"),
    examSubjectController.createExamSubject
);

/**
 * Get Subjects By Exam
 */
router.get(
    "/exam/:examId",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("exam", "examId"),
    examSubjectController.getSubjectsByExam
);

/**
 * Get Exam Subject By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("exam_subject", "id"),
    examSubjectController.getExamSubjectById
);

/**
 * Update Exam Subject
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("exam_subject", "id"),
    examSubjectController.updateExamSubject
);

/**
 * Delete Exam Subject
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("exam_subject", "id"),
    examSubjectController.deleteExamSubject
);

module.exports = router;