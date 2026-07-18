const academicYearModel = require("../models/academicYear.model");

/**
 * Create Academic Year
 */
async function createAcademicYear(data) {

    return await academicYearModel.createAcademicYear(data);

}

/**
 * Get All Academic Years
 */
async function getAcademicYearsBySchool(schoolId) {

    return await academicYearModel.getAcademicYearsBySchool(schoolId);

}

/**
 * Get Academic Year By ID
 */
async function getAcademicYearById(id) {

    return await academicYearModel.getAcademicYearById(id);

}

/**
 * Update Academic Year
 */
async function updateAcademicYear(id, data) {

    return await academicYearModel.updateAcademicYear(id, data);

}

/**
 * Delete Academic Year
 */
async function deleteAcademicYear(id) {

    const academicYear =
        await academicYearModel.deleteAcademicYear(id);

    if (!academicYear) {

        throw new Error("Academic Year not found");

    }

    return academicYear;

}

module.exports = {

    createAcademicYear,

    getAcademicYearsBySchool,

    getAcademicYearById,

    updateAcademicYear,

    deleteAcademicYear

};