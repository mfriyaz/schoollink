const express = require("express");

const tenant = require("../middleware/tenantGuard");

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
    authorizeRoles("School Admin", "Teacher"),
    tenant.body("exam_subject", "exam_subject_id"),
    tenant.body("student", "student_id"),
    studentMarkController.createStudentMark
);

/**
 * Bulk Mark An Exam Subject For A Whole Class
 */
router.post(
    "/bulk",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.body("exam_subject", "exam_subject_id"),
    tenant.bodyList("student", "records", "student_id"),
    studentMarkController.bulkMarkExam
);

/**
 * Get Roster With Marks
 * (used by the Enter Marks screen)
 */
router.get(
    "/roster/:examSubjectId",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("exam_subject", "examSubjectId"),
    studentMarkController.getRosterWithMarks
);

/**
 * Get Marks By Exam Subject
 */
router.get(
    "/exam-subject/:examSubjectId",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("exam_subject", "examSubjectId"),
    tenant.teacherParam("exam_subject", "examSubjectId"),
    studentMarkController.getMarksByExamSubject
);

/**
 * Get Marks By Student
 */
router.get(
    "/student/:studentId",
    authenticate,
    authorizeRoles("School Admin", "Teacher", "Parent"),
    tenant.param("student", "studentId"),
    tenant.teacherParam("student", "studentId"),
    studentMarkController.getMarksByStudent
);

/**
 * Get Student Mark By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("student_mark", "id"),
    tenant.teacherParam("student_mark", "id"),
    studentMarkController.getStudentMarkById
);

/**
 * Update Student Mark
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("student_mark", "id"),
    tenant.teacherParam("student_mark", "id"),
    studentMarkController.updateStudentMark
);

/**
 * Delete Student Mark
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("student_mark", "id"),
    studentMarkController.deleteStudentMark
);

module.exports = router;