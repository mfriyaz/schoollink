const express = require("express");

const router = express.Router();

const teacherSubjectController =
    require("../controllers/teacherSubject.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Assign Teacher
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
    teacherSubjectController.createAssignment
);

/**
 * Get Assignments By School
 * (self-scoped from the JWT, not a client-supplied ID)
 */
router.get(
    "/mine",
    authenticate,
    authorizeRoles("School Admin"),
    teacherSubjectController.getAssignmentsBySchool
);

/**
 * Get Assignments By Teacher
 * (Teacher role needs this to populate their own
 * Class/Subject dropdowns on Create Post)
 */
router.get(
    "/teacher/:teacherId",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    teacherSubjectController.getAssignmentsByTeacher
);

/**
 * Get Assignment By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    teacherSubjectController.getAssignmentById
);

/**
 * Delete Assignment
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    teacherSubjectController.deleteAssignment
);

module.exports = router;