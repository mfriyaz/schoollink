const examSubjectService = require("../services/examSubject.service");
const examService = require("../services/exam.service");
const response = require("../utils/response");

/**
 * Assign Subject To Exam
 */
async function createExamSubject(req, res) {

    try {

        const exam = await examService.getExamById(
            req.body.exam_id,
            req.user.school_id
        );

        if (!exam) {

            return response.error(
                res,
                "Exam not found",
                404
            );

        }

        const examSubject =
            await examSubjectService.createExamSubject(req.body);

        return response.success(
            res,
            examSubject,
            "Subject assigned to exam successfully",
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
 * Get Subjects By Exam
 */
async function getSubjectsByExam(req, res) {

    try {

        const subjects =
            await examSubjectService.getSubjectsByExam(
                req.params.examId
            );

        return response.success(
            res,
            subjects,
            "Exam subjects retrieved successfully"
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
 * Get Exam Subject By ID
 */
async function getExamSubjectById(req, res) {

    try {

        const examSubject =
            await examSubjectService.getExamSubjectById(
                req.params.id
            );

        if (!examSubject) {

            return response.error(
                res,
                "Exam subject not found",
                404
            );

        }

        return response.success(
            res,
            examSubject,
            "Exam subject retrieved successfully"
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
 * Update Exam Subject
 */
async function updateExamSubject(req, res) {

    try {

        const examSubject =
            await examSubjectService.updateExamSubject(
                req.params.id,
                req.body
            );

        if (!examSubject) {

            return response.error(
                res,
                "Exam subject not found",
                404
            );

        }

        return response.success(
            res,
            examSubject,
            "Exam subject updated successfully"
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
 * Delete Exam Subject
 */
async function deleteExamSubject(req, res) {

    try {

        const examSubject =
            await examSubjectService.deleteExamSubject(
                req.params.id
            );

        if (!examSubject) {

            return response.error(
                res,
                "Exam subject not found",
                404
            );

        }

        return response.success(
            res,
            examSubject,
            "Exam subject deleted successfully"
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

    createExamSubject,

    getSubjectsByExam,

    getExamSubjectById,

    updateExamSubject,

    deleteExamSubject

};