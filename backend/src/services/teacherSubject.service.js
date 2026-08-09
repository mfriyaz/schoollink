const teacherSubjectModel = require("../models/teacherSubject.model");

/**
 * Assign Teacher
 */
async function createAssignment(data) {

    return await teacherSubjectModel.createAssignment(data);

}

/**
 * Get Assignments By School
 */
async function getAssignmentsBySchool(schoolId) {

    return await teacherSubjectModel.getAssignmentsBySchool(schoolId);

}

/**
 * Get Assignments By Teacher
 */
async function getAssignmentsByTeacher(teacherId) {

    return await teacherSubjectModel.getAssignmentsByTeacher(teacherId);

}

/**
 * Get Assignment By ID
 */
async function getAssignmentById(id) {

    return await teacherSubjectModel.getAssignmentById(id);

}

/**
 * Delete Assignment
 */
async function deleteAssignment(id) {

    return await teacherSubjectModel.deleteAssignment(id);

}

module.exports = {

    createAssignment,

    getAssignmentsBySchool,

    getAssignmentsByTeacher,

    getAssignmentById,

    deleteAssignment

};