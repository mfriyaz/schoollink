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
async function getAllExams(schoolId) {

    return await examModel.getAllExams(schoolId);

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
async function updateExam(id, data) {

    return await examModel.updateExam(id, data);

}

/**
 * Delete Exam
 */
async function deleteExam(id) {

    return await examModel.deleteExam(id);

}

module.exports = {

    createExam,

    getAllExams,

    getExamById,

    updateExam,

    deleteExam

};