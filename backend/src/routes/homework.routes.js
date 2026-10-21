const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const homeworkController =
    require("../controllers/homework.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create Homework
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.body("teacher_subject", "teacher_subject_id"),
    homeworkController.createHomework
);

/**
 * Get Homework For Student
 * (Parent's feed - Parent role needs this, unlike the others)
 */
router.get(
    "/student/:studentId",
    authenticate,
    authorizeRoles("School Admin", "Teacher", "Parent"),
    tenant.param("student", "studentId"),
    homeworkController.getHomeworkForStudent
);

/**
 * Get Homework By Teacher Subject
 */
router.get(
    "/teacher-subject/:teacherSubjectId",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("teacher_subject", "teacherSubjectId"),
    homeworkController.getHomeworkByTeacherSubject
);

/**
 * Get Homework By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("homework", "id"),
    homeworkController.getHomeworkById
);

/**
 * Update Homework
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("homework", "id"),
    homeworkController.updateHomework
);

/**
 * Delete Homework
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("homework", "id"),
    homeworkController.deleteHomework
);

module.exports = router;