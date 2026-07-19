const express = require("express");

const router = express.Router();

const subjectController = require("../controllers/subject.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create Subject
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    subjectController.createSubject
);

/**
 * Get Subjects By School
 */
router.get(
    "/school/:schoolId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    subjectController.getSubjectsBySchool
);

/**
 * Get Subject By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    subjectController.getSubjectById
);

/**
 * Update Subject
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    subjectController.updateSubject
);

/**
 * Delete Subject
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    subjectController.deleteSubject
);

module.exports = router;