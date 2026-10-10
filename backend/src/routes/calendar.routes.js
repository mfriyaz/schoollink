const express = require("express");

const router = express.Router();

const calendarController = require("../controllers/calendar.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

// Any logged-in user of the school can read the calendar
router.get("/", authenticate, calendarController.getCalendar);

router.get("/day/:date", authenticate, calendarController.getDayStatus);

// Only the School Admin manages it
router.put(
    "/weekly-off",
    authenticate,
    authorizeRoles("School Admin"),
    calendarController.updateWeeklyOff
);

router.post(
    "/days",
    authenticate,
    authorizeRoles("School Admin"),
    calendarController.createDay
);

router.put(
    "/days/:id",
    authenticate,
    authorizeRoles("School Admin"),
    calendarController.updateDay
);

router.delete(
    "/days/:id",
    authenticate,
    authorizeRoles("School Admin"),
    calendarController.deleteDay
);

module.exports = router;
