const express = require("express");

const router = express.Router();

const schoolController = require("../controllers/school.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create School
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Super Admin"),
    schoolController.createSchool
);

/**
 * Get School By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin"),
    schoolController.getSchoolById
);

/**
 * Get All Schools
 */
router.get(
    "/",
    authenticate,
    authorizeRoles("Super Admin"),
    schoolController.getAllSchools
);

/**
 * Update School
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin"),
    schoolController.updateSchool
);

/**
 * Update School Governance
 * (subscription, status, limits)
 */
router.patch(
    "/:id/governance",
    authenticate,
    authorizeRoles("Super Admin"),
    schoolController.updateSchoolGovernance
);

/**
 * Delete School
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin"),
    schoolController.deleteSchool
);

module.exports = router;