const teacherModel = require("../models/teacher.model");

/**
 * Create Teacher
 */
async function createTeacher(data) {

    return await teacherModel.createTeacher(data);

}

/**
 * Get Teachers By School
 */
async function getTeachersBySchool(schoolId) {

    return await teacherModel.getTeachersBySchool(schoolId);

}

/**
 * Get Teacher By ID
 */
async function getTeacherById(id) {

    return await teacherModel.getTeacherById(id);

}

/**
 * Update Teacher
 */
async function updateTeacher(id, data) {

    return await teacherModel.updateTeacher(id, data);

}

/**
 * Delete Teacher
 */
async function deleteTeacher(id) {

    return await teacherModel.deleteTeacher(id);

}

module.exports = {

    createTeacher,

    getTeachersBySchool,

    getTeacherById,

    updateTeacher,

    deleteTeacher

};