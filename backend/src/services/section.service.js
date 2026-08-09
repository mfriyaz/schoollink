const sectionModel = require("../models/section.model");

async function createSection(data) {
    return await sectionModel.createSection(data);
}

async function getSectionsByClass(classId, schoolId) {
    return await sectionModel.getSectionsByClass(classId, schoolId);
}

async function getAllSectionsForClass(classId, schoolId) {
    return await sectionModel.getAllSectionsForClass(classId, schoolId);
}

async function getSectionById(id, schoolId) {
    return await sectionModel.getSectionById(id, schoolId);
}

async function updateSection(id, schoolId, data) {
    return await sectionModel.updateSection(id, schoolId, data);
}

async function deactivateSection(id, schoolId) {
    return await sectionModel.deactivateSection(id, schoolId);
}

async function reactivateSection(id, schoolId) {
    return await sectionModel.reactivateSection(id, schoolId);
}

module.exports = {

    createSection,

    getSectionsByClass,

    getAllSectionsForClass,

    getSectionById,

    updateSection,

    deactivateSection,

    reactivateSection

};
