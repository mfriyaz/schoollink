const subjectModel = require("../models/subject.model");

async function createSubject(data) {
    return await subjectModel.createSubject(data);
}

async function getSubjectsBySchool(schoolId) {
    return await subjectModel.getSubjectsBySchool(schoolId);
}

async function getAllSubjectsForSchool(schoolId) {
    return await subjectModel.getAllSubjectsForSchool(schoolId);
}

async function getSubjectById(id, schoolId) {
    return await subjectModel.getSubjectById(id, schoolId);
}

async function updateSubject(id, schoolId, data) {
    return await subjectModel.updateSubject(id, schoolId, data);
}

async function deactivateSubject(id, schoolId) {
    return await subjectModel.deactivateSubject(id, schoolId);
}

async function reactivateSubject(id, schoolId) {
    return await subjectModel.reactivateSubject(id, schoolId);
}

module.exports = {

    createSubject,

    getSubjectsBySchool,

    getAllSubjectsForSchool,

    getSubjectById,

    updateSubject,

    deactivateSubject,

    reactivateSubject

};
