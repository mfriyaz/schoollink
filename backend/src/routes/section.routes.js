const express = require("express");

const router = express.Router();

const sectionController = require("../controllers/section.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create Section
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
    sectionController.createSection
);

/**
 * Get Sections By Class (active only, for pickers)
 */
router.get(
    "/class/:classId",
    authenticate,
    authorizeRoles("School Admin"),
    sectionController.getSectionsByClass
);

/**
 * Get All Sections For Class For Management (active + inactive)
 */
router.get(
    "/class/:classId/manage",
    authenticate,
    authorizeRoles("School Admin"),
    sectionController.getAllSectionsForClass
);

/**
 * Get Section By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    sectionController.getSectionById
);

/**
 * Update Section
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    sectionController.updateSection
);

/**
 * Deactivate Section (soft delete)
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    sectionController.deactivateSection
);

/**
 * Reactivate Section
 */
router.patch(
    "/:id/reactivate",
    authenticate,
    authorizeRoles("School Admin"),
    sectionController.reactivateSection
);

module.exports = router;
