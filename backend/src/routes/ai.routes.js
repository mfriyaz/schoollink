const express = require("express");

const router = express.Router();

const controller = require("../controllers/ai.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const writers = [authenticate, authorizeRoles("School Admin", "Teacher")];

router.get("/status", ...writers, controller.status);
router.post("/improve", ...writers, controller.improve);
router.post("/translate", ...writers, controller.translate);
router.post("/report-remarks", ...writers, controller.reportRemarks);

module.exports = router;
