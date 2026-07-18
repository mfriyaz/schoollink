const classModel = require("../models/class.model");

/**
 * Create Class
 */
async function createClass(data) {

    return await classModel.createClass(data);

}

/**
 * Get Classes By Academic Year
 */
async function getClassesByAcademicYear(academicYearId) {

    return await classModel.getClassesByAcademicYear(
        academicYearId
    );

}

/**
 * Get Class By ID
 */
async function getClassById(id) {

    return await classModel.getClassById(id);

}

/**
 * Update Class
 */
async function updateClass(id, data) {

    const existingClass =
        await classModel.getClassById(id);

    if (!existingClass) {

        throw new Error("Class not found");

    }

    return await classModel.updateClass(
        id,
        data
    );

}

/**
 * Delete Class
 */
async function deleteClass(id) {

    const existingClass =
        await classModel.getClassById(id);

    if (!existingClass) {

        throw new Error("Class not found");

    }

    return await classModel.deleteClass(id);

}

module.exports = {

    createClass,

    getClassesByAcademicYear,

    getClassById,

    updateClass,

    deleteClass

};