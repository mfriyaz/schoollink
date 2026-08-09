const examService = require("../services/exam.service");
const response = require("../utils/response");

/**
 * Create Exam
 */
async function createExam(req, res) {

    try {

        const exam =
            await examService.createExam({

                ...req.body,

                school_id: req.user.school_id

            });

        return response.success(
            res,
            exam,
            "Exam created successfully",
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
 * Get All Exams
 */
async function getAllExams(req, res) {

    try {

        const exams =
            await examService.getAllExams(req.user.school_id);

        return response.success(
            res,
            exams,
            "Exams retrieved successfully"
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
 * Get Exam By ID
 */
async function getExamById(req, res) {

    try {

        const exam =
            await examService.getExamById(
                req.params.id,
                req.user.school_id
            );

        if (!exam) {

            return response.error(
                res,
                "Exam not found",
                404
            );

        }

        return response.success(
            res,
            exam,
            "Exam retrieved successfully"
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
 * Update Exam
 */
async function updateExam(req, res) {

    try {

        const exam =
            await examService.updateExam(
                req.params.id,
                req.body
            );

        if (!exam) {

            return response.error(
                res,
                "Exam not found",
                404
            );

        }

        return response.success(
            res,
            exam,
            "Exam updated successfully"
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
 * Delete Exam
 */
async function deleteExam(req, res) {

    try {

        const exam =
            await examService.deleteExam(
                req.params.id
            );

        if (!exam) {

            return response.error(
                res,
                "Exam not found",
                404
            );

        }

        return response.success(
            res,
            exam,
            "Exam deleted successfully"
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

    createExam,

    getAllExams,

    getExamById,

    updateExam,

    deleteExam

};