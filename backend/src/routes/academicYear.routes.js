const express = require("express");

const tenant = require("../middleware/tenantGuard");

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
    authorizeRoles("School Admin"),
    academicYearController.createAcademicYear
);

/**
 * Current year, year list and year-end rollover
 * (always for the signed-in admin's own school)
 */
router.get(
    "/current",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    academicYearController.getCurrentYear
);

router.get(
    "/mine",
    authenticate,
    authorizeRoles("School Admin"),
    academicYearController.listMyYears
);

router.post(
    "/rollover",
    authenticate,
    authorizeRoles("School Admin"),
    academicYearController.startNewYear
);

/**
 * Get All Academic Years By School
 */
router.get(
    "/school/:schoolId",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.ownSchool("schoolId"),
    academicYearController.getAcademicYearsBySchool
);

/**
 * Get Academic Year By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("academic_year", "id"),
    academicYearController.getAcademicYearById
);

/**
 * Update Academic Year
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("academic_year", "id"),
    academicYearController.updateAcademicYear
);

/**
 * Delete Academic Year
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("academic_year", "id"),
    academicYearController.deleteAcademicYear
);

module.exports = router;