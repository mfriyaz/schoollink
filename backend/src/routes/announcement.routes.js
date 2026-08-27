const express = require("express");

const router = express.Router();

const announcementController = require("../controllers/announcement.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Create Announcement
 */
router.post(
    "/",
    authenticate,
    authorizeRoles(
        "School Admin"
    ),
    announcementController.createAnnouncement
);

/**
 * Get All Announcements
 * (unfiltered by audience - Admin-only; other roles should
 * use /active/:audience instead so they only see what's
 * actually meant for them)
 */
router.get(
    "/",
    authenticate,
    authorizeRoles(
        "School Admin"
    ),
    announcementController.getAllAnnouncements
);

/**
 * Get Active Announcements
 */
router.get(
    "/active/:audience",
    authenticate,
    announcementController.getActiveAnnouncements
);

/**
 * Get Expired Announcements
 * (must come before /:id, otherwise Express would match
 * "expired" as if it were an announcement id)
 */
router.get(
    "/expired",
    authenticate,
    authorizeRoles(
        "School Admin"
    ),
    announcementController.getExpiredAnnouncements
);

/**
 * Get Announcement By ID
 */
router.get(
    "/:id",
    authenticate,
    announcementController.getAnnouncementById
);

/**
 * Update Announcement
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles(
        "School Admin"
    ),
    announcementController.updateAnnouncement
);

/**
 * Delete Announcement
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles(
        "School Admin"
    ),
    announcementController.deleteAnnouncement
);

module.exports = router;