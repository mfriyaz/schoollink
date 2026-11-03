const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const controller = require("../controllers/leaveRequest.controller");

const { authenticate } = require("../middleware/auth.middleware");

const { authorizeRoles } = require("../middleware/role.middleware");

// Parent: ask for leave, see my requests, withdraw a waiting one
router.post("/", authenticate, authorizeRoles("Parent"), tenant.body("student", "student_id"), controller.create);

router.get("/mine", authenticate, authorizeRoles("Parent"), controller.mine);

router.delete("/:id", authenticate, authorizeRoles("Parent"), tenant.param("leave_request", "id"), controller.cancel);

// Staff: School Admin (whole school) and class teachers (their own class)
router.get("/", authenticate, authorizeRoles("School Admin", "Teacher"), controller.list);

router.patch("/:id/decision", authenticate, authorizeRoles("School Admin", "Teacher"), tenant.param("leave_request", "id"), controller.decide);

module.exports = router;
