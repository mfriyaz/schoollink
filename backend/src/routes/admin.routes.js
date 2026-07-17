const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin.controller");

const {
    authenticateToken
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

router.post(
    "/",
    authenticateToken,
    authorizeRoles("Super Admin"),
    adminController.createAdmin
);

module.exports = router;