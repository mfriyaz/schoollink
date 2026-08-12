const homeworkModel = require("../models/homework.model");
const notifierService = require("./notifier.service");

/**
 * Create Homework
 */
async function createHomework(data) {

    const homework = await homeworkModel.createHomework(data);

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

    deleteHomework

};