const announcementModel = require("../models/announcement.model");

/**
 * Create Announcement
 */
async function createAnnouncement(data) {

    if (!data.title || data.title.trim() === "") {
        throw new Error("Title is required.");
    }

    if (!data.description || data.description.trim() === "") {
        throw new Error("Description is required.");
    }

    const validAudiences = [
        "All",
        "Teachers",
        "Parents",
        "Students",
        "School Admin"
    ];

    if (!validAudiences.includes(data.target_audience)) {
        throw new Error("Invalid target audience.");
    }

    return await announcementModel.createAnnouncement(data);

}

/**
 * Get All Announcements
 */
async function getAllAnnouncements() {

    return await announcementModel.getAllAnnouncements();

}

/**
 * Get Announcement By ID
 */
async function getAnnouncementById(id) {

    const announcement =
        await announcementModel.getAnnouncementById(id);

    if (!announcement) {
        throw new Error("Announcement not found.");
    }

    return announcement;

}

/**
 * Update Announcement
 */
async function updateAnnouncement(id, data) {

    const announcement =
        await announcementModel.getAnnouncementById(id);

    if (!announcement) {
        throw new Error("Announcement not found.");
    }

    if (!data.title || data.title.trim() === "") {
        throw new Error("Title is required.");
    }

    if (!data.description || data.description.trim() === "") {
        throw new Error("Description is required.");
    }

    const validAudiences = [
        "All",
        "Teachers",
        "Parents",
        "Students",
        "School Admin"
    ];

    if (!validAudiences.includes(data.target_audience)) {
        throw new Error("Invalid target audience.");
    }

    return await announcementModel.updateAnnouncement(id, data);

}

/**
 * Delete Announcement
 */
async function deleteAnnouncement(id) {

    const announcement =
        await announcementModel.getAnnouncementById(id);

    if (!announcement) {
        throw new Error("Announcement not found.");
    }

    return await announcementModel.deleteAnnouncement(id);

}

/**
 * Get Active Announcements
 */
async function getActiveAnnouncements(targetAudience) {

    return await announcementModel.getActiveAnnouncements(
        targetAudience
    );

}

module.exports = {

    createAnnouncement,

    getAllAnnouncements,

    getAnnouncementById,

    updateAnnouncement,

    deleteAnnouncement,

    getActiveAnnouncements

};