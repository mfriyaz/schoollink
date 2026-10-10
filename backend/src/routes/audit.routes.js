const express = require("express");

const router = express.Router();

const auditController = require("../controllers/audit.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

router.get(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
    auditController.getAuditLogs
);

module.exports = router;
