const express = require("express");

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
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    homeworkController.createHomework
);

/**
 * Get Homework By Teacher Subject
 */
router.get(
    "/teacher-subject/:teacherSubjectId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    homeworkController.getHomeworkByTeacherSubject
);

/**
 * Get Homework By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    homeworkController.getHomeworkById
);

/**
 * Update Homework
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    homeworkController.updateHomework
);

/**
 * Delete Homework
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    homeworkController.deleteHomework
);

module.exports = router;