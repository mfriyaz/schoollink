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
        "School Admin",
        "Super Admin"
    ),
    announcementController.createAnnouncement
);

/**
 * Get All Announcements
 */
router.get(
    "/",
    authenticate,
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
        "School Admin",
        "Super Admin"
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
        "School Admin",
        "Super Admin"
    ),
    announcementController.deleteAnnouncement
);

module.exports = router;