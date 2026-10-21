const homeworkSubmissionModel = require("../models/homeworkSubmission.model");

const notifierService = require("./notifier.service");

const db = require("../config/database");

const { deleteFileByUrl } = require("./fileStorage.service");

const MAX_PHOTOS_PER_SUBMISSION = 5;

// How many times a parent may replace an earlier submission
const MAX_RESUBMITS = 3;

function rule(message, status = 403) {

    const err = new Error(message);

    err.status = status;

    return err;

}

const VALID_REACTIONS = ["thumbs_up", "heart", "star"];

async function submitHomework(data) {

    const hasPhotos = Array.isArray(data.photo_urls) && data.photo_urls.length > 0;

    const hasVoice = Boolean(data.voice_url);

    if (!hasPhotos && !hasVoice) {

        throw new Error("At least one photo or a voice recording is required.");

    }

    if (hasPhotos && data.photo_urls.length > MAX_PHOTOS_PER_SUBMISSION) {

        throw new Error(`You can submit up to ${MAX_PHOTOS_PER_SUBMISSION} photos.`);

    }

    const rules = await homeworkSubmissionModel.getHomeworkRules(data.homework_id);

    if (!rules) {

        throw rule("Homework not found.", 404);

    }

    if (!rules.open) {

        throw rule("Submissions are closed for this homework. Please ask the teacher to reopen it.");

    }

    if (hasPhotos && rules.allow_photo_submission === false) {

        throw rule("Photo submission is not allowed for this homework.");

    }

    if (hasVoice && rules.allow_voice_submission === false) {

        throw rule("Voice submission is not allowed for this homework.");

    }

    const existing = await homeworkSubmissionModel.getSubmission(
        data.homework_id,
        data.student_id
    );

    if (existing) {

        if (existing.locked) {

            throw rule("The teacher has already reviewed this. Please ask the teacher to unlock it if you need to change it.");

        }

        if (existing.resubmit_count >= MAX_RESUBMITS) {

            throw rule(`You have already replaced this ${MAX_RESUBMITS} times. Please ask the teacher to unlock it.`);

        }

    }

    const saved = await homeworkSubmissionModel.submitHomework({

        ...data,

        is_late: rules.past_due

    });

    // Remove the files this submission replaced (best effort)
    if (existing) {

        const keep = new Set([...(data.photo_urls || []), data.voice_url].filter(Boolean));

        const old = [...(existing.photo_urls || []), existing.voice_url].filter(Boolean);

        for (const url of old) {

            if (!keep.has(url)) {

                await deleteFileByUrl(url);

            }

        }

    }

    return saved;

}

async function getSubmission(homeworkId, studentId) {

    return await homeworkSubmissionModel.getSubmission(homeworkId, studentId);

}

async function getSubmissionsByHomework(homeworkId) {

    return await homeworkSubmissionModel.getSubmissionsByHomework(homeworkId);

}

/**
 * Verify a parent has at least one child in the class/section
 * this homework was posted to - not the same as owning one
 * specific submission, since this is about whether they belong
 * to this post's audience at all.
 */
async function parentBelongsToHomeworkClass(userId, homeworkId) {

    const result = await db.query(
        `
        SELECT 1
        FROM homework hw
        JOIN teacher_subjects ts ON hw.teacher_subject_id = ts.id
        JOIN students st
            ON st.class_id = ts.class_id
            AND st.section_id = ts.section_id
        JOIN parent_students ps ON ps.student_id = st.id
        WHERE hw.id = $1
        AND ps.parent_user_id = $2
        `,
        [homeworkId, userId]
    );

    return result.rows.length > 0;

}

/**
 * Get every submission for a post, for a Parent to view -
 * only allowed when the teacher has explicitly turned on
 * "showcase" mode for this specific post, and only for a
 * parent who actually has a child in that post's class.
 */
async function getSubmissionsForParentView(homeworkId, userId) {

    const homeworkResult = await db.query(
        `SELECT allow_view_all_submissions FROM homework WHERE id = $1`,
        [homeworkId]
    );

    const homework = homeworkResult.rows[0];

    if (!homework) {

        throw new Error("Post not found.");

    }

    if (!homework.allow_view_all_submissions) {

        throw new Error("The teacher hasn't enabled shared viewing for this post.");

    }

    const belongs = await parentBelongsToHomeworkClass(userId, homeworkId);

    if (!belongs) {

        throw new Error("This post isn't for one of your children.");

    }

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
async function teacherOwnsSubmission(userId, submissionId) {

    const result = await db.query(
        `
        SELECT 1
        FROM homework_submissions hs
        JOIN homework hw ON hw.id = hs.homework_id
        JOIN teacher_subjects ts ON hw.teacher_subject_id = ts.id
        JOIN teachers t ON ts.teacher_id = t.id
        WHERE t.user_id = $1
        AND hs.id = $2
        `,
        [userId, submissionId]
    );

    return result.rows.length > 0;

}

async function unlockSubmission(submissionId) {

    return await homeworkSubmissionModel.unlockSubmission(submissionId);

}

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

    getSubmissionsForParentView,

    getSubmissionCount,

    reactToSubmission,

    parentOwnsStudent,

    teacherOwnsHomework,

    teacherOwnsSubmission,

    unlockSubmission

};
