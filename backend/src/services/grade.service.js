const gradeModel = require("../models/grade.model");

/**
 * Create Grade
 */
async function createGrade(data) {

    return await gradeModel.createGrade(data);

}

/**
 * Get All Grades
 */
async function getAllGrades(schoolId) {

    return await gradeModel.getAllGrades(schoolId);

}

/**
 * Get Grade By ID
 */
async function getGradeById(id, schoolId) {

    return await gradeModel.getGradeById(id, schoolId);

}

/**
 * Update Grade
 */
async function updateGrade(id, schoolId, data) {

    return await gradeModel.updateGrade(id, schoolId, data);

}

/**
 * Delete Grade
 */
async function deleteGrade(id, schoolId) {

    return await gradeModel.deleteGrade(id, schoolId);

}

module.exports = {

    createGrade,

    getAllGrades,

    getGradeById,

    updateGrade,

    deleteGrade

};
