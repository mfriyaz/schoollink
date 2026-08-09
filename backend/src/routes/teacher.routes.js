const express = require("express");

const router = express.Router();

const teacherController = require("../controllers/teacher.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create Teacher
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
    teacherController.createTeacher
);

/**
 * Get Teachers By School
 * (self-scoped from the JWT)
 */
router.get(
    "/mine",
    authenticate,
    authorizeRoles("School Admin"),
    teacherController.getTeachersBySchool
);

/**
 * Get My Teacher Profile
 * (must be defined before "/:id" so Express doesn't
 * treat "me" as an :id param)
 */
router.get(
    "/me",
    authenticate,
    authorizeRoles("Teacher"),
    teacherController.getMyTeacherProfile
);

/**
 * Get Teacher By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    teacherController.getTeacherById
);

/**
 * Update Teacher
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    teacherController.updateTeacher
);

/**
 * Deactivate Teacher (soft delete)
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    teacherController.deactivateTeacher
);

/**
 * Reactivate Teacher
 */
router.patch(
    "/:id/reactivate",
    authenticate,
    authorizeRoles("School Admin"),
    teacherController.reactivateTeacher
);

module.exports = router;
