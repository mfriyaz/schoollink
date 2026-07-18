const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create School Administrator
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Super Admin"),
    adminController.createAdmin
);

module.exports = router;