const studentMarkService = require("../services/studentMark.service");
const response = require("../utils/response");

/**
 * Create Student Mark
 */
async function createStudentMark(req, res) {

    try {

        const studentMark =
            await studentMarkService.createStudentMark(req.body);

        return response.success(
            res,
            studentMark,
            "Student mark created successfully",
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
 * Get Marks By Exam Subject
 */
async function getMarksByExamSubject(req, res) {

    try {

        const marks =
            await studentMarkService.getMarksByExamSubject(
                req.params.examSubjectId
            );

        return response.success(
            res,
            marks,
            "Student marks retrieved successfully"
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
 * Get Marks By Student
 */
async function getMarksByStudent(req, res) {

    try {

        const marks =
            await studentMarkService.getMarksByStudent(
                req.params.studentId
            );

        return response.success(
            res,
            marks,
            "Student marks retrieved successfully"
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
 * Get Student Mark By ID
 */
async function getStudentMarkById(req, res) {

    try {

        const studentMark =
            await studentMarkService.getStudentMarkById(
                req.params.id
            );

        if (!studentMark) {

            return response.error(
                res,
                "Student mark not found",
                404
            );

        }

        return response.success(
            res,
            studentMark,
            "Student mark retrieved successfully"
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
 * Update Student Mark
 */
async function updateStudentMark(req, res) {

    try {

        const studentMark =
            await studentMarkService.updateStudentMark(
                req.params.id,
                req.body
            );

        if (!studentMark) {

            return response.error(
                res,
                "Student mark not found",
                404
            );

        }

        return response.success(
            res,
            studentMark,
            "Student mark updated successfully"
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
 * Delete Student Mark
 */
async function deleteStudentMark(req, res) {

    try {

        const studentMark =
            await studentMarkService.deleteStudentMark(
                req.params.id
            );

        if (!studentMark) {

            return response.error(
                res,
                "Student mark not found",
                404
            );

        }

        return response.success(
            res,
            studentMark,
            "Student mark deleted successfully"
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

    createStudentMark,

    getMarksByExamSubject,

    getMarksByStudent,

    getStudentMarkById,

    updateStudentMark,

    deleteStudentMark

};