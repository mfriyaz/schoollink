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

const uploadExcel = require("../middleware/uploadExcel.middleware");

/**
 * Download Excel Import Template
 */
router.get(
    "/template",
    authenticate,
    authorizeRoles("School Admin"),
    studentController.downloadTemplate
);

/**
 * Bulk Upload Students From Excel
 */
router.post(
    "/bulk-upload",
    authenticate,
    authorizeRoles("School Admin"),
    uploadExcel.single("file"),
    studentController.bulkUploadStudents
);

/**
 * Create Student
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
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
    authorizeRoles("School Admin"),
    studentController.getAllStudents
);

/**
 * Get Students By Class
 */
router.get(
    "/class/:classId",
    authenticate,
    authorizeRoles("School Admin"),
    studentController.getStudentsByClass
);

/**
 * Get Students By Section
 */
router.get(
    "/section/:sectionId",
    authenticate,
    authorizeRoles("School Admin"),
    studentController.getStudentsBySection
);

/**
 * Get Student By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    studentController.getStudentById
);

/**
 * Update Student
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    studentController.updateStudent
);

/**
 * Delete Student
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    studentController.deactivateStudent
);

/**
 * Reactivate Student
 */
router.patch(
    "/:id/reactivate",
    authenticate,
    authorizeRoles("School Admin"),
    studentController.reactivateStudent
);

module.exports = router;