const gradeModel = require("../models/grade.model");

/**
 * Create Grade
 */
async function createGrade(data) {

    // Business Rule:
    // Minimum percentage cannot be greater than maximum percentage
    if (Number(data.minimum_percentage) > Number(data.maximum_percentage)) {
        throw new Error(
            "Minimum percentage cannot be greater than maximum percentage."
        );
    }

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
async function getGradeById(id) {

    return await gradeModel.getGradeById(id);

}

/**
 * Update Grade
 */
async function updateGrade(id, data) {

    if (Number(data.minimum_percentage) > Number(data.maximum_percentage)) {
        throw new Error(
            "Minimum percentage cannot be greater than maximum percentage."
        );
    }

    return await gradeModel.updateGrade(id, data);

}

/**
 * Delete Grade
 */
async function deleteGrade(id) {

    return await gradeModel.deleteGrade(id);

}

/**
 * Find Grade By Percentage
 */
async function findGradeByPercentage(schoolId, percentage) {

    return await gradeModel.findGradeByPercentage(
        schoolId,
        percentage
    );

}

module.exports = {

    createGrade,

    getAllGrades,

    getGradeById,

    updateGrade,

    deleteGrade,

    findGradeByPercentage

};