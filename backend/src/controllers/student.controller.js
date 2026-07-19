const studentService = require("../services/student.service");
const response = require("../utils/response");

/**
 * Create Student
 */
async function createStudent(req, res) {

    try {

        const newStudent =
            await studentService.createStudent(req.body);

        return response.success(
            res,
            newStudent,
            "Student created successfully",
            201
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get All Students
 */
async function getAllStudents(req, res) {

    try {

        const students =
            await studentService.getAllStudents();

        return response.success(
            res,
            students,
            "Students retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get Student By ID
 */
async function getStudentById(req, res) {

    try {

        const student =
            await studentService.getStudentById(req.params.id);

        if (!student) {

            return response.error(
                res,
                "Student not found",
                404
            );

        }

        return response.success(
            res,
            student,
            "Student retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get Students By Class
 */
async function getStudentsByClass(req, res) {

    try {

        const students =
            await studentService.getStudentsByClass(
                req.params.classId
            );

        return response.success(
            res,
            students,
            "Students retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get Students By Section
 */
async function getStudentsBySection(req, res) {

    try {

        const students =
            await studentService.getStudentsBySection(
                req.params.sectionId
            );

        return response.success(
            res,
            students,
            "Students retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Update Student
 */
async function updateStudent(req, res) {

    try {

        const updatedStudent =
            await studentService.updateStudent(
                req.params.id,
                req.body
            );

        if (!updatedStudent) {

            return response.error(
                res,
                "Student not found",
                404
            );

        }

        return response.success(
            res,
            updatedStudent,
            "Student updated successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Delete Student
 */
async function deleteStudent(req, res) {

    try {

        const deletedStudent =
            await studentService.deleteStudent(req.params.id);

        if (!deletedStudent) {

            return response.error(
                res,
                "Student not found",
                404
            );

        }

        return response.success(
            res,
            deletedStudent,
            "Student deleted successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

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