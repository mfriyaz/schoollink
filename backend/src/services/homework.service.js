const homeworkModel = require("../models/homework.model");

/**
 * Create Homework
 */
async function createHomework(data) {

    return await homeworkModel.createHomework(data);

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

    getHomeworkById,

    updateHomework,

    deleteHomework

};