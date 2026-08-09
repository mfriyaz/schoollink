const acknowledgementModel = require("../models/acknowledgement.model");
const notifierService = require("./notifier.service");

/**
 * Get Homework Acknowledgement Summary
 */
async function getHomeworkAckSummary(homeworkId) {

    const rows =
        await acknowledgementModel.getHomeworkAckSummary(homeworkId);

    const acknowledgedCount =
        rows.filter((r) => r.is_acknowledged).length;

    return {

        total_students: rows.length,

        acknowledged_count: acknowledgedCount,

        pending_count: rows.length - acknowledgedCount,

        students: rows

    };

}

/**
 * Get Announcement Acknowledgement Summary
 */
async function getAnnouncementAckSummary(announcementId) {

    const result =
        await acknowledgementModel.getAnnouncementAckSummary(
            announcementId
        );

    if (!result) {

        return null;

    }

    if (!result.supported) {

        return result;

    }

    const acknowledgedCount =
        result.rows.filter((r) => r.is_acknowledged).length;

    return {

        supported: true,

        total_students: result.rows.length,

        acknowledged_count: acknowledgedCount,

        pending_count: result.rows.length - acknowledgedCount,

        students: result.rows

    };

}

/**
 * Get Announcements For Student
 */
async function getAnnouncementsForStudent(studentId) {

    return await acknowledgementModel.getAnnouncementsForStudent(
        studentId
    );

}

/**
 * Acknowledge a Post (Parent action)
 */
async function acknowledgePost(data) {

    const acknowledgement =
        await acknowledgementModel.upsertAcknowledgement(data);

    try {

        await notifierService.notifyOwnerOfAcknowledgement(
            data.post_type,
            data.post_id,
            data.student_id
        );

    } catch (err) {

        console.error("Failed to notify post owner of acknowledgement:", err);

    }

    return acknowledgement;

}

module.exports = {

    getHomeworkAckSummary,

    getAnnouncementAckSummary,

    getAnnouncementsForStudent,

    acknowledgePost

};
