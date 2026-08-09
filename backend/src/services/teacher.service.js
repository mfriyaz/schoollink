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
async function getTeacherById(id, schoolId) {

    return await teacherModel.getTeacherById(id, schoolId);

}

/**
 * Get Teacher By User ID
 */
async function getTeacherByUserId(userId) {

    return await teacherModel.getTeacherByUserId(userId);

}

/**
 * Update Teacher
 */
async function updateTeacher(id, schoolId, data) {

    return await teacherModel.updateTeacher(id, schoolId, data);

}

/**
 * Deactivate Teacher
 */
async function deactivateTeacher(id, schoolId) {

    return await teacherModel.deactivateTeacher(id, schoolId);

}

/**
 * Reactivate Teacher
 */
async function reactivateTeacher(id, schoolId) {

    return await teacherModel.reactivateTeacher(id, schoolId);

}

module.exports = {

    createTeacher,

    getTeachersBySchool,

    getTeacherById,

    getTeacherByUserId,

    updateTeacher,

    deactivateTeacher,

    reactivateTeacher

};
