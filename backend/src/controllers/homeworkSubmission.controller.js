const homeworkSubmissionService = require("../services/homeworkSubmission.service");
const response = require("../utils/response");

/**
 * Submit (or resubmit) a homework photo
 */
async function submitHomework(req, res) {

    try {

        const { homework_id, student_id, photo_urls, remarks } = req.body;

        if (!homework_id || !student_id || !photo_urls) {

            return response.error(
                res,
                "homework_id, student_id and photo_urls are required",
                400
            );

        }

        const owns = await homeworkSubmissionService.parentOwnsStudent(
            req.user.id,
            student_id
        );

        if (!owns) {

            return response.error(
                res,
                "This student is not linked to your account",
                403
            );

        }

        const submission = await homeworkSubmissionService.submitHomework({

            homework_id,

            student_id,

            parent_user_id: req.user.id,

            photo_urls,

            remarks

        });

        return response.success(
            res,
            submission,
            "Homework submitted successfully",
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

/**
 * Get a specific student's submission for a homework post
 */
async function getSubmission(req, res) {

    try {

        const { homeworkId, studentId } = req.params;

        if (req.user.role === "Parent") {

            const owns = await homeworkSubmissionService.parentOwnsStudent(
                req.user.id,
                studentId
            );

            if (!owns) {

                return response.error(
                    res,
                    "This student is not linked to your account",
                    403
                );

            }

        }

        const submission = await homeworkSubmissionService.getSubmission(
            homeworkId,
            studentId
        );

        return response.success(
            res,
            submission || null,
            "Submission retrieved successfully"
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
 * Get every submission for a homework post (Teacher's view)
 */
async function getSubmissionsByHomework(req, res) {

    try {

        const { homeworkId } = req.params;

        if (req.user.role === "Teacher") {

            const owns = await homeworkSubmissionService.teacherOwnsHomework(
                req.user.id,
                homeworkId
            );

            if (!owns) {

                return response.error(
                    res,
                    "This post is not one of yours",
                    403
                );

            }

        }

        const submissions = await homeworkSubmissionService.getSubmissionsByHomework(
            homeworkId
        );

        return response.success(
            res,
            submissions,
            "Submissions retrieved successfully"
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
 * Get just the submission count for a homework post
 */
async function getSubmissionCount(req, res) {

    try {

        const { homeworkId } = req.params;

        if (req.user.role === "Teacher") {

            const owns = await homeworkSubmissionService.teacherOwnsHomework(
                req.user.id,
                homeworkId
            );

            if (!owns) {

                return response.error(
                    res,
                    "This post is not one of yours",
                    403
                );

            }

        }

        const count = await homeworkSubmissionService.getSubmissionCount(
            homeworkId
        );

        return response.success(
            res,
            { count },
            "Submission count retrieved successfully"
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
 * Teacher reacts to (and marks reviewed) a submission
 */
async function reactToSubmission(req, res) {

    try {

        const { submissionId } = req.params;

        const { reaction } = req.body;

        if (req.user.role === "Teacher" && req.body.homework_id) {

            const owns = await homeworkSubmissionService.teacherOwnsHomework(
                req.user.id,
                req.body.homework_id
            );

            if (!owns) {

                return response.error(
                    res,
                    "This post is not one of yours",
                    403
                );

            }

        }

        const submission = await homeworkSubmissionService.reactToSubmission(
            submissionId,
            reaction,
            req.user.id
        );

        if (!submission) {

            return response.error(
                res,
                "Submission not found",
                404
            );

        }

        return response.success(
            res,
            submission,
            "Reaction saved successfully"
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

    submitHomework,

    getSubmission,

    getSubmissionsByHomework,

    getSubmissionCount,

    reactToSubmission

};
