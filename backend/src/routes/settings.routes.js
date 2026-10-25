const express = require("express");

const router = express.Router();

const settingsController = require("../controllers/settings.controller");
const schoolThemeController = require("../controllers/schoolTheme.controller");
const attendanceModeController = require("../controllers/attendanceMode.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

router.get(
    "/me",
    authenticate,
    settingsController.getSettings
);

router.patch(
    "/me",
    authenticate,
    settingsController.updateSettings
);

/**
 * School colour theme
 * Everyone reads it; only the School Admin changes it.
 */
router.get(
    "/school-theme",
    authenticate,
    schoolThemeController.getSchoolTheme
);

router.put(
    "/school-theme",
    authenticate,
    authorizeRoles("School Admin"),
    schoolThemeController.updateSchoolTheme
);

router.get(
    "/subscription-notice",
    authenticate,
    authorizeRoles("School Admin"),
    schoolThemeController.getSubscriptionNotice
);

router.get(
    "/attendance-mode",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    attendanceModeController.getAttendanceMode
);

router.put(
    "/attendance-mode",
    authenticate,
    authorizeRoles("School Admin"),
    attendanceModeController.updateAttendanceMode
);

module.exports = router;
