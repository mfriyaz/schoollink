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
 * Get Homework By ID
 */
async function getHomeworkById(id) {

    return await homeworkModel.getHomeworkById(id);

}

/**
 * Update Homework
 */
async function updateHomework(id, data) {

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