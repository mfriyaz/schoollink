const express = require("express");

const router = express.Router();

const acknowledgementController =
    require("../controllers/acknowledgement.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Get Homework Acknowledgement Summary
 */
router.get(
    "/homework/:homeworkId/summary",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    acknowledgementController.getHomeworkAckSummary
);

/**
 * Get Announcement Acknowledgement Summary
 */
router.get(
    "/announcement/:announcementId/summary",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    acknowledgementController.getAnnouncementAckSummary
);

/**
 * Get Announcements For Student
 * (Parent's feed - Parent role needs this)
 */
router.get(
    "/announcement/student/:studentId",
    authenticate,
    authorizeRoles("School Admin", "Teacher", "Parent"),
    acknowledgementController.getAnnouncementsForStudent
);

/**
 * Acknowledge a Post
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Parent"),
    acknowledgementController.acknowledgePost
);

module.exports = router;
