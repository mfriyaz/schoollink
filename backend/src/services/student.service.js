const studentModel = require("../models/student.model");

/**
 * Create Student
 */
async function createStudent(studentData) {

    return await studentModel.createStudent(studentData);

}

/**
 * Get All Students (Supports Search)
 */
async function getAllStudents(search = "") {

    return await studentModel.getAllStudents(search);

}

/**
 * Get Student By ID
 */
async function getStudentById(id) {

    return await studentModel.getStudentById(id);

}

/**
 * Get Students By Class
 */
async function getStudentsByClass(classId) {

    return await studentModel.getStudentsByClass(classId);

}

/**
 * Get Students By Section
 */
async function getStudentsBySection(sectionId) {

    return await studentModel.getStudentsBySection(sectionId);

}

/**
 * Update Student
 */
async function updateStudent(id, studentData) {

    return await studentModel.updateStudent(
        id,
        studentData
    );

}

/**
 * Delete Student
 */
async function deleteStudent(id) {

    return await studentModel.deleteStudent(id);

}

module.exports = {

    createStudent,

    getAllStudents,

    getStudentById,

    getStudentsByClass,

    getStudentsBySection,

    updateStudent,

    deleteStudent

};