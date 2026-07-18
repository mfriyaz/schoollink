const express = require("express");

const router = express.Router();

const academicYearController = require("../controllers/academicYear.controller");

const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

/**
 * Create Academic Year
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    academicYearController.createAcademicYear
);

/**
 * Get All Academic Years By School
 */
router.get(
    "/school/:schoolId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    academicYearController.getAcademicYearsBySchool
);

/**
 * Get Academic Year By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    academicYearController.getAcademicYearById
);

/**
 * Update Academic Year
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    academicYearController.updateAcademicYear
);

/**
 * Delete Academic Year
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    academicYearController.deleteAcademicYear
);

module.exports = router;