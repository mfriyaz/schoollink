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
            await announcementService.getAnnouncementById(id);

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

        const announcement =
            await announcementService.updateAnnouncement(
                id,
                req.body
            );

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

        const announcement =
            await announcementService.deleteAnnouncement(id);

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

module.exports = {

    createAnnouncement,

    getAllAnnouncements,

    getAnnouncementById,

    updateAnnouncement,

    deleteAnnouncement,

    getActiveAnnouncements

};