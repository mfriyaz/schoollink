const express = require("express");
const router = express.Router();

const schoolController = require("../controllers/school.controller");

const {
    authenticateToken
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

// Create
router.post(
    "/",
    authenticateToken,
    authorizeRoles("Super Admin"),
    schoolController.createSchool
);

// Get One School
router.get(
    "/:id",
    authenticateToken,
    authorizeRoles("Super Admin"),
    schoolController.getSchoolById
);

// Get All
router.get(
    "/",
    authenticateToken,
    authorizeRoles("Super Admin"),
    schoolController.getAllSchools
);

// Update School
router.put(
    "/:id",
    authenticateToken,
    authorizeRoles("Super Admin"),
    schoolController.updateSchool
);

// Delete School
router.delete(
    "/:id",
    authenticateToken,
    authorizeRoles("Super Admin"),
    schoolController.deleteSchool
);
module.exports = router;