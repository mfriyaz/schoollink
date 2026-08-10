const express = require("express");

const router = express.Router();

const parentController = require("../controllers/parent.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Get My Children
 */
router.get(
    "/me/children",
    authenticate,
    authorizeRoles("Parent"),
    parentController.getMyChildren
);

/**
 * Create (or reuse) a Parent account and link them to a student
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
    parentController.createOrLinkParent
);

/**
 * Get every parent linked to a student
 */
router.get(
    "/student/:studentId",
    authenticate,
    authorizeRoles("School Admin"),
    parentController.getParentsForStudent
);

module.exports = router;
