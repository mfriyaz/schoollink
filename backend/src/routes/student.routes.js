const express = require("express");

const router = express.Router();

const studentController = require("../controllers/student.controller");

const {
    studentValidationRules,
    validate
} = require("../validators/student.validator");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create Student
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    studentValidationRules,
    validate,
    studentController.createStudent
);

/**
 * Get All Students
 */
router.get(
    "/",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    studentController.getAllStudents
);

/**
 * Get Students By Class
 */
router.get(
    "/class/:classId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    studentController.getStudentsByClass
);

/**
 * Get Students By Section
 */
router.get(
    "/section/:sectionId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    studentController.getStudentsBySection
);

/**
 * Get Student By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    studentController.getStudentById
);

/**
 * Update Student
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    studentController.updateStudent
);

/**
 * Delete Student
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    studentController.deleteStudent
);

module.exports = router;