const studentService = require("../services/student.service");
const studentBulkImportService = require("../services/studentBulkImport.service");
const response = require("../utils/response");
const asyncHandler = require("../middleware/asyncHandler");
const { assertUnderLimit } = require("../utils/schoolLimits");

/**
 * Download Excel Template
 */
const downloadTemplate = asyncHandler(async (req, res) => {

    const buffer = await studentBulkImportService.generateTemplate(
        req.user.school_id
    );

    res.setHeader(
        "Content-Type",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
        "Content-Disposition",
        "attachment; filename=student_import_template.xlsx"
    );

    res.send(buffer);

});

/**
 * Bulk Upload Students From Excel
 */
const bulkUploadStudents = asyncHandler(async (req, res) => {

    if (!req.file) {

        return response.error(res, "No file was uploaded", 400);

    }

    const result = await studentBulkImportService.bulkImportStudents(
        req.user.school_id,
        req.file.buffer
    );

    return response.success(
        res,
        result,
        `Import complete: ${result.created_count} created, ${result.failed_count} failed`
    );

});

/**
 * Create Student
 */
const createStudent = asyncHandler(async (req, res) => {

    await assertUnderLimit(req.user.school_id, "students");

    const student = await studentService.createStudent({

        ...req.body,

        school_id: req.user.school_id

    });

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

    const students = await studentService.getAllStudents(
        req.user.school_id,
        search
    );

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

    const student = await studentService.getStudentById(
        req.params.id,
        req.user.school_id
    );

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
        req.params.classId,
        req.user.school_id
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
        req.params.sectionId,
        req.user.school_id
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
        req.user.school_id,
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
 * Deactivate Student (soft delete)
 */
const deactivateStudent = asyncHandler(async (req, res) => {

    const student = await studentService.deactivateStudent(
        req.params.id,
        req.user.school_id
    );

    if (!student) {

        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;

    }

    return response.success(
        res,
        student,
        "Student deactivated successfully"
    );

});

/**
 * Reactivate Student
 */
const reactivateStudent = asyncHandler(async (req, res) => {

    const student = await studentService.reactivateStudent(
        req.params.id,
        req.user.school_id
    );

    if (!student) {

        const error = new Error("Student not found");
        error.statusCode = 404;
        throw error;

    }

    return response.success(
        res,
        student,
        "Student reactivated successfully"
    );

});

module.exports = {

    createStudent,

    getAllStudents,

    getStudentById,

    getStudentsByClass,

    getStudentsBySection,

    updateStudent,

    deactivateStudent,

    reactivateStudent,

    downloadTemplate,

    bulkUploadStudents

};
