const express = require("express");

const tenant = require("../middleware/tenantGuard");

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
    authorizeRoles("School Admin"),
    subjectController.createSubject
);

/**
 * Get My Subjects (active only, for pickers)
 * (self-scoped from the JWT, not a client-supplied ID)
 */
router.get(
    "/mine",
    authenticate,
    authorizeRoles("School Admin"),
    subjectController.getSubjectsBySchool
);

/**
 * Get All Subjects For Management (active + inactive)
 */
router.get(
    "/manage/all",
    authenticate,
    authorizeRoles("School Admin"),
    subjectController.getAllSubjectsForManagement
);

/**
 * Get Subject By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("subject", "id"),
    subjectController.getSubjectById
);

/**
 * Update Subject
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("subject", "id"),
    subjectController.updateSubject
);

/**
 * Deactivate Subject (soft delete)
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("subject", "id"),
    subjectController.deactivateSubject
);

/**
 * Reactivate Subject
 */
router.patch(
    "/:id/reactivate",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("subject", "id"),
    subjectController.reactivateSubject
);

module.exports = router;
