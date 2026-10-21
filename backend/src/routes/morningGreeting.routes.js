const express = require("express");

const tenant = require("../middleware/tenantGuard");

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
    tenant.body("student", "student_id"),
    morningGreetingController.submitGreeting
);

/**
 * Get today's greeting for a specific student
 */
router.get(
    "/student/:studentId/today",
    authenticate,
    authorizeRoles("Parent"),
    tenant.param("student", "studentId"),
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
    tenant.param("greeting", "greetingId"),
    morningGreetingController.reactToGreeting
);

/**
 * React to multiple greetings at once
 */
router.patch(
    "/bulk-react",
    authenticate,
    authorizeRoles("Teacher"),
    tenant.bodyList("greeting", "greeting_ids"),
    morningGreetingController.bulkReactToGreetings
);

/**
 * Turn shared greeting viewing on/off for the teacher's class
 */
router.patch(
    "/class-teacher/shared-setting",
    authenticate,
    authorizeRoles("Teacher"),
    morningGreetingController.setSharedGreetingsSetting
);

/**
 * Get the current shared-greetings setting for the teacher
 */
router.get(
    "/class-teacher/shared-setting",
    authenticate,
    authorizeRoles("Teacher"),
    morningGreetingController.getSharedGreetingsSetting
);

/**
 * Get today's classmate greetings for a Parent
 */
router.get(
    "/student/:studentId/classmates-today",
    authenticate,
    authorizeRoles("Parent"),
    tenant.param("student", "studentId"),
    morningGreetingController.getTodaysGreetingsForClassmates
);

module.exports = router;
