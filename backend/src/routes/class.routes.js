const express = require("express");

const router = express.Router();

const classController = require("../controllers/class.controller");

const { authenticate } = require("../middleware/auth.middleware");

const { authorizeRoles } = require("../middleware/role.middleware");

/**
 * Create Class
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
    classController.createClass
);

/**
 * Get My Classes (active only, for pickers)
 */
router.get(
    "/mine",
    authenticate,
    authorizeRoles("School Admin"),
    classController.getMyClasses
);

/**
 * Get All Classes For Management (active + inactive)
 */
router.get(
    "/manage/all",
    authenticate,
    authorizeRoles("School Admin"),
    classController.getAllClassesForManagement
);

/**
 * Get Classes By Academic Year
 */
router.get(
    "/academic-year/:academicYearId",
    authenticate,
    authorizeRoles("School Admin"),
    classController.getClassesByAcademicYear
);

/**
 * Get Class By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    classController.getClassById
);

/**
 * Update Class
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    classController.updateClass
);

/**
 * Deactivate Class (soft delete)
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    classController.deactivateClass
);

/**
 * Reactivate Class
 */
router.patch(
    "/:id/reactivate",
    authenticate,
    authorizeRoles("School Admin"),
    classController.reactivateClass
);

module.exports = router;