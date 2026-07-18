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
    authorizeRoles("Super Admin", "School Admin"),
    sectionController.createSection
);

/**
 * Get Sections By Class
 */
router.get(
    "/class/:classId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    sectionController.getSectionsByClass
);

/**
 * Get Section By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    sectionController.getSectionById
);

/**
 * Update Section
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    sectionController.updateSection
);

/**
 * Delete Section
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    sectionController.deleteSection
);

module.exports = router;