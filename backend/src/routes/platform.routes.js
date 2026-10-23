const express = require("express");

const router = express.Router();

const platformController = require("../controllers/platform.controller");
const admin = require("../controllers/platformAdmin.controller");
const aiAdmin = require("../controllers/ai.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Platform - Onboard New School
 */
router.post(
    "/onboard-school",
    authenticate,
    authorizeRoles("Super Admin"),
    platformController.onboardSchool
);

const sa = [authenticate, authorizeRoles("Super Admin")];

router.get("/overview", ...sa, admin.overview);
router.get("/ai-usage", ...sa, aiAdmin.platformAiUsage);
router.get("/schools", ...sa, admin.listSchools);
router.get("/schools/:id", ...sa, admin.schoolDetail);
router.get("/schools/:id/records/:type", ...sa, admin.schoolRecords);
router.get("/schools/:id/ai", ...sa, aiAdmin.getSchoolAi);
router.put("/schools/:id/ai", ...sa, aiAdmin.updateSchoolAi);
router.post("/schools/:id/status", ...sa, admin.setStatus);
router.post("/schools/:id/payments", ...sa, admin.addPayment);
router.patch("/schools/:id/notes", ...sa, admin.updateNotes);
router.delete("/payments/:paymentId", ...sa, admin.deletePayment);
router.get("/payments", ...sa, admin.listPayments);
router.get("/subscription-history", ...sa, admin.subscriptionHistory);
router.post("/school-admins/:userId/reset-password", ...sa, admin.resetAdminPassword);

module.exports = router;