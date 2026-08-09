const homeworkSubmissionModel = require("../models/homeworkSubmission.model");

const notifierService = require("./notifier.service");

const db = require("../config/database");

const MAX_PHOTOS_PER_SUBMISSION = 5;

const VALID_REACTIONS = ["thumbs_up", "heart", "star"];

async function submitHomework(data) {

    if (!Array.isArray(data.photo_urls) || data.photo_urls.length === 0) {

        throw new Error("At least one photo is required.");

    }

    if (data.photo_urls.length > MAX_PHOTOS_PER_SUBMISSION) {

        throw new Error(`You can submit up to ${MAX_PHOTOS_PER_SUBMISSION} photos.`);

    }

    return await homeworkSubmissionModel.submitHomework(data);

}

async function getSubmission(homeworkId, studentId) {

    return await homeworkSubmissionModel.getSubmission(homeworkId, studentId);

}

async function getSubmissionsByHomework(homeworkId) {

    return await homeworkSubmissionModel.getSubmissionsByHomework(homeworkId);

}

async function getSubmissionCount(homeworkId) {

    return await homeworkSubmissionModel.getSubmissionCount(homeworkId);

}

async function reactToSubmission(submissionId, reaction, reviewedBy) {

    if (!VALID_REACTIONS.includes(reaction)) {

        throw new Error("Invalid reaction.");

    }

    const submission = await homeworkSubmissionModel.reactToSubmission(
        submissionId,
        reaction,
        reviewedBy
    );

    if (!submission) {

        return null;

    }

    const submissionWithContext = await homeworkSubmissionModel.getSubmissionById(
        submissionId
    );

    try {

        await notifierService.notifyParentOfReview(submissionWithContext);

    } catch (err) {

        console.error("Failed to notify parent of review:", err);

    }

    return submission;

}

/**
 * Verify a parent (by their users.id) is actually linked to
 * the given student.
 */
async function parentOwnsStudent(userId, studentId) {

    const result = await db.query(
        `
        SELECT 1
        FROM parent_students
        WHERE parent_user_id = $1
        AND student_id = $2
        `,
        [userId, studentId]
    );

    return result.rows.length > 0;

}

/**
 * Verify a teacher (by their users.id) owns the class/subject
 * behind the given homework post.
 */
async function teacherOwnsHomework(userId, homeworkId) {

    const result = await db.query(
        `
        SELECT hw.id
        FROM homework hw
        JOIN teacher_subjects ts ON hw.teacher_subject_id = ts.id
        JOIN teachers t ON ts.teacher_id = t.id
        WHERE t.user_id = $1
        AND hw.id = $2
        `,
        [userId, homeworkId]
    );

    return result.rows.length > 0;

}

module.exports = {

    submitHomework,

    getSubmission,

    getSubmissionsByHomework,

    getSubmissionCount,

    reactToSubmission,

    parentOwnsStudent,

    teacherOwnsHomework

};
