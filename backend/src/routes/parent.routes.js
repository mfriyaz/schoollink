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

module.exports = router;
