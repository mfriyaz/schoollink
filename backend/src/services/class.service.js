const classModel = require("../models/class.model");

async function createClass(data) {
    return await classModel.createClass(data);
}

async function getClassesByAcademicYear(academicYearId, schoolId) {
    return await classModel.getClassesByAcademicYear(academicYearId, schoolId);
}

async function getClassesBySchool(schoolId) {
    return await classModel.getClassesBySchool(schoolId);
}

async function getAllClassesForSchool(schoolId) {
    return await classModel.getAllClassesForSchool(schoolId);
}

async function getClassById(id, schoolId) {
    return await classModel.getClassById(id, schoolId);
}

async function updateClass(id, schoolId, data) {
    return await classModel.updateClass(id, schoolId, data);
}

async function deactivateClass(id, schoolId) {
    return await classModel.deactivateClass(id, schoolId);
}

async function reactivateClass(id, schoolId) {
    return await classModel.reactivateClass(id, schoolId);
}

module.exports = {

    createClass,

    getClassesByAcademicYear,

    getClassesBySchool,

    getAllClassesForSchool,

    getClassById,

    updateClass,

    deactivateClass,

    reactivateClass

};
