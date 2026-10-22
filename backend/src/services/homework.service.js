const homeworkModel = require("../models/homework.model");
const notifierService = require("./notifier.service");

const MAX_KEY_CHARS = 8000;

function cleanKey(v) {

    return typeof v === "string" ? v.replace(/\r/g, "").trim().slice(0, MAX_KEY_CHARS) : "";

}

/**
 * Read the answer key, scoped like update (a Teacher only for their own posts)
 */
async function getAnswerKey(id, schoolId, teacherId) {

    const existing = await getHomeworkById(id, schoolId, teacherId);

    if (!existing) {

        return undefined;

    }

    return await homeworkModel.getAnswerKey(id);

}

/**
 * Save (or, when empty, remove) the answer key
 */
async function saveAnswerKey(id, schoolId, teacherId, text) {

    const existing = await getHomeworkById(id, schoolId, teacherId);

    if (!existing) {

        return undefined;

    }

    const key = cleanKey(text);

    if (!key) {

        await homeworkModel.deleteAnswerKey(id);

        return null;

    }

    // Edited by a person, so it is no longer purely AI-written
    return await homeworkModel.saveAnswerKey(id, key, false);

}

/**
 * Create Homework
 */
async function createHomework(data) {

    const homework = await homeworkModel.createHomework(data);

    // Optional teacher-only answer key (kept out of the homework record)
    const key = cleanKey(data.answer_key);

    if (key) {

        try {

            await homeworkModel.saveAnswerKey(homework.id, key, true);

        } catch (err) {

            console.error("Failed to save answer key:", err.message);

        }

    }

    // Notification failures shouldn't block the post itself from
    // being created - log and move on rather than throwing.
    try {

        await notifierService.notifyParentsOfHomework(homework.id);

    } catch (err) {

        console.error("Failed to notify parents of homework:", err);

    }

    return homework;

}

/**
 * Get Homework By Teacher Subject
 */
async function getHomeworkByTeacherSubject(teacherSubjectId) {

    return await homeworkModel.getHomeworkByTeacherSubject(
        teacherSubjectId
    );

}

/**
 * Get Homework For Student
 */
async function getHomeworkForStudent(studentId) {

    return await homeworkModel.getHomeworkForStudent(studentId);

}

/**
 * Get Homework By ID, scoped to a school (and optionally a
 * specific teacher, so a Teacher can only see their own posts
 * while a School Admin can see any post at their school).
 */
async function getHomeworkById(id, schoolId, teacherId) {

    const homework = await homeworkModel.getHomeworkByIdForSchool(id, schoolId);

    if (!homework) {

        return null;

    }

    if (teacherId && homework.teacher_id !== teacherId) {

        return null;

    }

    return homework;

}

/**
 * Update Homework, with the same ownership scoping as above.
 */
async function updateHomework(id, schoolId, teacherId, data) {

    const existing = await getHomeworkById(id, schoolId, teacherId);

    if (!existing) {

        return null;

    }

    return await homeworkModel.updateHomework(id, data);

}

/**
 * Close or reopen parent submissions, with the same ownership
 * scoping as update (a Teacher only for their own posts).
 */
async function setSubmissionsClosed(id, schoolId, teacherId, closed) {

    const existing = await getHomeworkById(id, schoolId, teacherId);

    if (!existing) {

        return null;

    }

    return await homeworkModel.setSubmissionsClosed(id, closed);

}

/**
 * Delete Homework
 */
async function deleteHomework(id) {

    return await homeworkModel.deleteHomework(id);

}

module.exports = {

    createHomework,

    getHomeworkByTeacherSubject,

    getHomeworkForStudent,

    getHomeworkById,

    updateHomework,

    setSubmissionsClosed,

    getAnswerKey,

    saveAnswerKey,

    deleteHomework

};