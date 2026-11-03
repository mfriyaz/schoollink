const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const controller = require("../controllers/attention.controller");

const { authenticate } = require("../middleware/auth.middleware");

const { authorizeRoles } = require("../middleware/role.middleware");

// School Admin sees the whole school; a class teacher sees only their own class
router.get("/", authenticate, authorizeRoles("School Admin", "Teacher"), controller.list);

router.post(
    "/:studentId/followup",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("student", "studentId"),
    controller.addFollowup
);

module.exports = router;
