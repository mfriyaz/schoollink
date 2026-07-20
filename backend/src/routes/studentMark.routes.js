const express = require("express");

const router = express.Router();

const studentMarkController =
    require("../controllers/studentMark.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create Student Mark
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    studentMarkController.createStudentMark
);

/**
 * Get Marks By Exam Subject
 */
router.get(
    "/exam-subject/:examSubjectId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    studentMarkController.getMarksByExamSubject
);

/**
 * Get Marks By Student
 */
router.get(
    "/student/:studentId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher", "Parent"),
    studentMarkController.getMarksByStudent
);

/**
 * Get Student Mark By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    studentMarkController.getStudentMarkById
);

/**
 * Update Student Mark
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    studentMarkController.updateStudentMark
);

/**
 * Delete Student Mark
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    studentMarkController.deleteStudentMark
);

module.exports = router;