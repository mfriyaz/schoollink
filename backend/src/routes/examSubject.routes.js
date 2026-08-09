const express = require("express");

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
    examSubjectController.createExamSubject
);

/**
 * Get Subjects By Exam
 */
router.get(
    "/exam/:examId",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    examSubjectController.getSubjectsByExam
);

/**
 * Get Exam Subject By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    examSubjectController.getExamSubjectById
);

/**
 * Update Exam Subject
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    examSubjectController.updateExamSubject
);

/**
 * Delete Exam Subject
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    examSubjectController.deleteExamSubject
);

module.exports = router;