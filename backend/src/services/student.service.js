const studentModel = require("../models/student.model");

/**
 * Create Student
 */
async function createStudent(studentData) {
    return await studentModel.createStudent(studentData);
}

/**
 * Get All Students
 */
async function getAllStudents(schoolId, search = "") {
    return await studentModel.getAllStudents(schoolId, search);
}

/**
 * Get Student By ID
 */
async function getStudentById(id, schoolId) {
    return await studentModel.getStudentById(id, schoolId);
}

/**
 * Get Students By Class
 */
async function getStudentsByClass(classId, schoolId) {
    return await studentModel.getStudentsByClass(classId, schoolId);
}

/**
 * Get Students By Section
 */
async function getStudentsBySection(sectionId, schoolId) {
    return await studentModel.getStudentsBySection(sectionId, schoolId);
}

/**
 * Update Student
 */
async function updateStudent(id, schoolId, studentData) {
    return await studentModel.updateStudent(
        id,
        schoolId,
        studentData
    );
}

/**
 * Deactivate Student
 */
async function deactivateStudent(id, schoolId) {
    return await studentModel.deactivateStudent(id, schoolId);
}

/**
 * Reactivate Student
 */
async function reactivateStudent(id, schoolId) {
    return await studentModel.reactivateStudent(id, schoolId);
}

module.exports = {

    createStudent,

    getAllStudents,

    getStudentById,

    getStudentsByClass,

    getStudentsBySection,

    updateStudent,

    deactivateStudent,

    reactivateStudent

};
