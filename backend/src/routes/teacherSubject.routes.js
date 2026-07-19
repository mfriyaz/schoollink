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
    authorizeRoles("Super Admin", "School Admin"),
    teacherSubjectController.createAssignment
);

/**
 * Get Assignments By School
 */
router.get(
    "/school/:schoolId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    teacherSubjectController.getAssignmentsBySchool
);

/**
 * Get Assignment By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    teacherSubjectController.getAssignmentById
);

/**
 * Delete Assignment
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    teacherSubjectController.deleteAssignment
);

module.exports = router;