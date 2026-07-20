const studentMarkModel = require("../models/studentMark.model");

/**
 * Create Student Mark
 */
async function createStudentMark(data) {

    return await studentMarkModel.createStudentMark(data);

}

/**
 * Get Marks By Exam Subject
 */
async function getMarksByExamSubject(examSubjectId) {

    return await studentMarkModel.getMarksByExamSubject(examSubjectId);

}

/**
 * Get Marks By Student
 */
async function getMarksByStudent(studentId) {

    return await studentMarkModel.getMarksByStudent(studentId);

}

/**
 * Get Student Mark By ID
 */
async function getStudentMarkById(id) {

    return await studentMarkModel.getStudentMarkById(id);

}

/**
 * Update Student Mark
 */
async function updateStudentMark(id, data) {

    return await studentMarkModel.updateStudentMark(id, data);

}

/**
 * Delete Student Mark
 */
async function deleteStudentMark(id) {

    return await studentMarkModel.deleteStudentMark(id);

}

module.exports = {

    createStudentMark,

    getMarksByExamSubject,

    getMarksByStudent,

    getStudentMarkById,

    updateStudentMark,

    deleteStudentMark

};