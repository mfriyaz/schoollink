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
            await examService.getAllExams(
                req.user.school_id,
                req.user.role === "School Admin" && req.query.include_archived === "1"
            );

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

        const { exam_name, start_date, end_date } = req.body || {};

        if (!exam_name || !String(exam_name).trim() || !start_date || !end_date) {
            return response.error(res, "Exam name, start date and end date are required", 400);
        }

        if (end_date < start_date) {
            return response.error(res, "The end date cannot be before the start date", 400);
        }

        const exam =
            await examService.updateExam(
                req.params.id,
                req.user.school_id,
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
            "Exam deleted successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            err.status || 500
        );

    }

}

/**
 * Archive or restore an exam (keeps all marks and report cards)
 */
async function setExamArchived(req, res) {
    try {
        const exam = await examService.setExamArchived(
            req.params.id,
            req.user.school_id,
            req.body && req.body.archived === true
        );
        if (!exam) {
            return response.error(res, "Exam not found", 404);
        }
        return response.success(
            res,
            exam,
            exam.is_active === false ? "Exam archived" : "Exam restored"
        );
    } catch (err) {
        return response.error(res, err.message, 500);
    }
}

module.exports = {

    setExamArchived,


    createExam,

    getAllExams,

    getExamById,

    updateExam,

    deleteExam

};