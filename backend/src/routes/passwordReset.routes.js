const express = require("express");

const router = express.Router();

const controller = require("../controllers/passwordReset.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.post(
    "/:userId/reset-password",
    authenticate,
    authorizeRoles("School Admin"),
    controller.resetUserPassword
);

module.exports = router;
