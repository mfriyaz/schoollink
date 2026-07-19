const subjectModel = require("../models/subject.model");

/**
 * Create Subject
 */
async function createSubject(data) {

    return await subjectModel.createSubject(data);

}

/**
 * Get Subjects By School
 */
async function getSubjectsBySchool(schoolId) {

    return await subjectModel.getSubjectsBySchool(schoolId);

}

/**
 * Get Subject By ID
 */
async function getSubjectById(id) {

    return await subjectModel.getSubjectById(id);

}

/**
 * Update Subject
 */
async function updateSubject(id, data) {

    return await subjectModel.updateSubject(id, data);

}

/**
 * Delete Subject
 */
async function deleteSubject(id) {

    return await subjectModel.deleteSubject(id);

}

module.exports = {

    createSubject,

    getSubjectsBySchool,

    getSubjectById,

    updateSubject,

    deleteSubject

};