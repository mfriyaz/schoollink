const acknowledgementService = require("../services/acknowledgement.service");
const response = require("../utils/response");

/**
 * Get Homework Acknowledgement Summary
 * (Teacher/Admin view: 20/28 Acknowledged, 2 Pending)
 */
async function getHomeworkAckSummary(req, res) {

    try {

        const summary =
            await acknowledgementService.getHomeworkAckSummary(
                req.params.homeworkId
            );

        return response.success(
            res,
            summary,
            "Acknowledgement summary retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get Announcement Acknowledgement Summary
 */
async function getAnnouncementAckSummary(req, res) {

    try {

        const summary =
            await acknowledgementService.getAnnouncementAckSummary(
                req.params.announcementId
            );

        if (!summary) {

            return response.error(
                res,
                "Announcement not found",
                404
            );

        }

        return response.success(
            res,
            summary,
            "Acknowledgement summary retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get Announcements For Student
 * (Parent's feed)
 */
async function getAnnouncementsForStudent(req, res) {

    try {

        const announcements =
            await acknowledgementService.getAnnouncementsForStudent(
                req.params.studentId
            );

        return response.success(
            res,
            announcements,
            "Announcements retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Acknowledge a Post
 * (Parent action: "Submit Acknowledgement" button)
 */
async function acknowledgePost(req, res) {

    try {

        const {
            post_type,
            post_id,
            student_id,
            remarks
        } = req.body;

        const acknowledgement =
            await acknowledgementService.acknowledgePost({

                post_type,

                post_id,

                student_id,

                parent_user_id: req.user.id,

                remarks

            });

        return response.success(
            res,
            acknowledgement,
            "Post acknowledged successfully",
            201
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

module.exports = {

    getHomeworkAckSummary,

    getAnnouncementAckSummary,

    getAnnouncementsForStudent,

    acknowledgePost

};
