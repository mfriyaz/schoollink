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
async function getAllExams() {

    return await examModel.getAllExams();

}

/**
 * Get Exam By ID
 */
async function getExamById(id) {

    return await examModel.getExamById(id);

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