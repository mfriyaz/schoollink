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
    authorizeRoles("Super Admin", "School Admin"),
    classController.createClass
);

/**
 * Get Classes By Academic Year
 */
router.get(
    "/academic-year/:academicYearId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    classController.getClassesByAcademicYear
);

/**
 * Get Class By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    classController.getClassById
);

/**
 * Update Class
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    classController.updateClass
);

/**
 * Delete Class
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    classController.deleteClass
);

module.exports = router;