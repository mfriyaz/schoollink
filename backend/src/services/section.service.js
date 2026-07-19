const sectionModel = require("../models/section.model");

/**
 * Create Section
 */
async function createSection(sectionData) {

    return await sectionModel.createSection(sectionData);

}

/**
 * Get Sections By Class
 */
async function getSectionsByClass(classId) {

    return await sectionModel.getSectionsByClass(classId);

}

/**
 * Get Section By ID
 */
async function getSectionById(id) {

    return await sectionModel.getSectionById(id);

}

/**
 * Update Section
 */
async function updateSection(id, sectionData) {

    return await sectionModel.updateSection(id, sectionData);

}

/**
 * Delete Section
 */
async function deleteSection(id) {

    return await sectionModel.deleteSection(id);

}

module.exports = {

    createSection,

    getSectionsByClass,

    getSectionById,

    updateSection,

    deleteSection

};