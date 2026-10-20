const examModel = require("../models/exam.model");

/**
 * Create Exam
 */
async function createExam(data) {

    return await examModel.createExam(data);

}

/**
 * Get All Exams
 */
async function getAllExams(schoolId, includeArchived = false) {

    return await examModel.getAllExams(schoolId, includeArchived);

}

/**
 * Get Exam By ID
 */
async function getExamById(id, schoolId) {

    return await examModel.getExamById(id, schoolId);

}

/**
 * Update Exam
 */
async function updateExam(id, schoolId, data) {

    return await examModel.updateExam(id, schoolId, data);

}

/**
 * Delete Exam
 */
async function deleteExam(id, schoolId) {

    return await examModel.deleteExam(id, schoolId);

}

/**
 * Archive or restore an exam
 */
async function setExamArchived(id, schoolId, archived) {

    return await examModel.setExamArchived(id, schoolId, archived);

}

module.exports = {

    setExamArchived,

    createExam,

    getAllExams,

    getExamById,

    updateExam,

    deleteExam

};