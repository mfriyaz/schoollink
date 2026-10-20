const examSubjectModel = require("../models/examSubject.model");

/**
 * Assign Subject To Exam
 */
async function createExamSubject(data) {

    return await examSubjectModel.createExamSubject(data);

}

/**
 * Get Subjects By Exam
 */
async function getSubjectsByExam(examId) {

    return await examSubjectModel.getSubjectsByExam(examId);

}

/**
 * Get Exam Subject By ID
 */
async function getExamSubjectById(id) {

    return await examSubjectModel.getExamSubjectById(id);

}

/**
 * Update Exam Subject
 */
async function updateExamSubject(id, schoolId, data) {

    return await examSubjectModel.updateExamSubject(id, schoolId, data);

}

/**
 * Delete Exam Subject
 */
async function deleteExamSubject(id, schoolId) {

    return await examSubjectModel.deleteExamSubject(id, schoolId);

}

module.exports = {

    createExamSubject,

    getSubjectsByExam,

    getExamSubjectById,

    updateExamSubject,

    deleteExamSubject

};