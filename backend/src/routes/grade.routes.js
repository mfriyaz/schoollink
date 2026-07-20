const express = require("express");

const router = express.Router();

const gradeController = require("../controllers/grade.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create Grade
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    gradeController.createGrade
);

/**
 * Get All Grades
 */
router.get(
    "/school/:schoolId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    gradeController.getAllGrades
);

/**
 * Get Grade By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    gradeController.getGradeById
);

/**
 * Update Grade
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    gradeController.updateGrade
);

/**
 * Delete Grade
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    gradeController.deleteGrade
);

module.exports = router;