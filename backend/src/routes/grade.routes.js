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
    authorizeRoles("School Admin"),
    gradeController.createGrade
);

/**
 * Get All Grades
 * (self-scoped from the JWT - no schoolId in the URL anymore)
 */
router.get(
    "/",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    gradeController.getAllGrades
);

/**
 * Get Grade By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    gradeController.getGradeById
);

/**
 * Update Grade
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    gradeController.updateGrade
);

/**
 * Delete Grade
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    gradeController.deleteGrade
);

module.exports = router;
