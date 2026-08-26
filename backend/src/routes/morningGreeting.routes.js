const express = require("express");

const router = express.Router();

const morningGreetingController = require("../controllers/morningGreeting.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Submit (or replace) today's Good Morning greeting
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Parent"),
    morningGreetingController.submitGreeting
);

/**
 * Get today's greeting for a specific student
 */
router.get(
    "/student/:studentId/today",
    authenticate,
    authorizeRoles("Parent"),
    morningGreetingController.getTodaysGreeting
);

/**
 * Get today's greetings for a class teacher's students
 */
router.get(
    "/class-teacher/today",
    authenticate,
    authorizeRoles("Teacher"),
    morningGreetingController.getTodaysGreetingsForClassTeacher
);

/**
 * React to a Good Morning greeting
 */
router.patch(
    "/:greetingId/react",
    authenticate,
    authorizeRoles("Teacher"),
    morningGreetingController.reactToGreeting
);

/**
 * React to multiple greetings at once
 */
router.patch(
    "/bulk-react",
    authenticate,
    authorizeRoles("Teacher"),
    morningGreetingController.bulkReactToGreetings
);

module.exports = router;
