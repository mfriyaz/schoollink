const studentService = require("../services/student.service");
const response = require("../utils/response");
const asyncHandler = require("../middleware/asyncHandler");

/**
 * Create Student
 */
const createStudent = asyncHandler(async (req, res) => {

    const student = await studentService.createStudent(req.body);

    return response.success(
        res,
        student,
        "Student created successfully",
        201
    );

});

/**
 * Get All Students
 */
const getAllStudents = asyncHandler(async (req, res) => {

    const search = req.query.search || "";

    const students = await studentService.getAllStudents(search);

    return response.success(
        res,
        students,
        "Students retrieved successfully"
    );

});

/**
 * Get Student By ID
 */
const getStudentById = asyncHandler(async (req, res) => {

    const student = await studentService.getStudentById(req.params.id);

    if (!student) {

        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;

    }

    return response.success(
        res,
        student,
        "Student retrieved successfully"
    );

});

/**
 * Get Students By Class
 */
const getStudentsByClass = asyncHandler(async (req, res) => {

    const students = await studentService.getStudentsByClass(
        req.params.classId
    );

    return response.success(
        res,
        students,
        "Students retrieved successfully"
    );

});

/**
 * Get Students By Section
 */
const getStudentsBySection = asyncHandler(async (req, res) => {

    const students = await studentService.getStudentsBySection(
        req.params.sectionId
    );

    return response.success(
        res,
        students,
        "Students retrieved successfully"
    );

});

/**
 * Update Student
 */
const updateStudent = asyncHandler(async (req, res) => {

    const student = await studentService.updateStudent(
        req.params.id,
        req.body
    );

    if (!student) {

        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;

    }

    return response.success(
        res,
        student,
        "Student updated successfully"
    );

});

/**
 * Delete Student
 */
const deleteStudent = asyncHandler(async (req, res) => {

    const student = await studentService.deleteStudent(
        req.params.id
    );

    if (!student) {

        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;

    }

    return response.success(
        res,
        student,
        "Student deleted successfully"
    );

});

module.exports = {

    createStudent,

    getAllStudents,

    getStudentById,

    getStudentsByClass,

    getStudentsBySection,

    updateStudent,

    deleteStudent

};