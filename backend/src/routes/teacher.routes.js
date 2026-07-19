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
    authorizeRoles("Super Admin", "School Admin"),
    teacherController.createTeacher
);

/**
 * Get Teachers By School
 */
router.get(
    "/school/:schoolId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    teacherController.getTeachersBySchool
);

/**
 * Get Teacher By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    teacherController.getTeacherById
);

/**
 * Update Teacher
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    teacherController.updateTeacher
);

/**
 * Delete Teacher
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    teacherController.deleteTeacher
);

module.exports = router;