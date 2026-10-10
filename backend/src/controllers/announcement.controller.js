const auditService = require("../services/audit.service");

const ANNOUNCEMENT_FIELDS = {
    title: "Title",
    description: "Description",
    target_audience: "Shared with",
    publish_date: "Publish date",
    expiry_date: "Expiry date",
    is_active: "Active",
    image_urls: "Photos"
};

const announcementService = require("../services/announcement.service");

/**
 * Create Announcement
 */
async function createAnnouncement(req, res) {

    try {

        const announcement =
            await announcementService.createAnnouncement({

                ...req.body,

                school_id: req.user.school_id

            });

        await auditService.logAudit(req, {
            action: "Created",
            entityType: "announcement",
            entityId: announcement.id,
            entityTitle: announcement.title,
            summary: `Published to ${announcement.target_audience}`
        });

        return res.status(201).json({

            success: true,

            message: "Announcement created successfully.",

            data: announcement

        });

    } catch (error) {

        console.error(error);

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

}

/**
 * Get All Announcements
 */
async function getAllAnnouncements(req, res) {

    try {

        const announcements =
            await announcementService.getAllAnnouncements(
                req.user.school_id
            );

        return res.status(200).json({

            success: true,

            data: announcements

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

/**
 * Get Announcement By ID
 */
async function getAnnouncementById(req, res) {

    try {

        const { id } = req.params;

        const announcement =
            await announcementService.getAnnouncementById(id, req.user.school_id);

        return res.status(200).json({

            success: true,

            data: announcement

        });

    } catch (error) {

        return res.status(404).json({

            success: false,

            message: error.message

        });

    }

}

/**
 * Update Announcement
 */
async function updateAnnouncement(req, res) {

    try {

        const { id } = req.params;

        let before = null;

        try {
            before = await announcementService.getAnnouncementById(id, req.user.school_id);
        } catch (e) {
            before = null;
        }

        const announcement =
            await announcementService.updateAnnouncement(
                id,
                req.body,
                req.user.school_id
            );

        await auditService.logAudit(req, {
            action: "Edited",
            entityType: "announcement",
            entityId: Number(id),
            entityTitle: announcement.title,
            summary: "Announcement edited",
            changes: auditService.diffFields(before, req.body, ANNOUNCEMENT_FIELDS)
        });

        return res.status(200).json({

            success: true,

            message: "Announcement updated successfully.",

            data: announcement

        });

    } catch (error) {

        return res.status(400).json({

            success: false,

            message: error.message

        });

    }

}

/**
 * Delete Announcement
 */
async function deleteAnnouncement(req, res) {

    try {

        const { id } = req.params;

        let before = null;

        try {
            before = await announcementService.getAnnouncementById(id, req.user.school_id);
        } catch (e) {
            before = null;
        }

        const announcement =
            await announcementService.deleteAnnouncement(id, req.user.school_id);

        await auditService.logAudit(req, {
            action: "Deleted",
            entityType: "announcement",
            entityId: Number(id),
            entityTitle: before ? before.title : null,
            summary: "Announcement deleted"
        });

        return res.status(200).json({

            success: true,

            message: "Announcement deleted successfully.",

            data: announcement

        });

    } catch (error) {

        return res.status(404).json({

            success: false,

            message: error.message

        });

    }

}

/**
 * Get Active Announcements
 */
async function getActiveAnnouncements(req, res) {

    try {

        const { audience } = req.params;

        const announcements =
            await announcementService.getActiveAnnouncements(
                req.user.school_id,
                audience
            );

        return res.status(200).json({

            success: true,

            data: announcements

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

/**
 * Get Expired Announcements
 */
async function getExpiredAnnouncements(req, res) {

    try {

        const announcements =
            await announcementService.getExpiredAnnouncements(
                req.user.school_id
            );

        return res.status(200).json({

            success: true,

            data: announcements

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

module.exports = {

    createAnnouncement,

    getAllAnnouncements,

    getAnnouncementById,

    updateAnnouncement,

    deleteAnnouncement,

    getActiveAnnouncements,

    getExpiredAnnouncements

};