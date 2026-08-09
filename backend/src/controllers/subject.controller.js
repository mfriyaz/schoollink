const subjectService = require("../services/subject.service");
const response = require("../utils/response");

/**
 * Create Subject
 */
async function createSubject(req, res) {

    try {

        const subject =
            await subjectService.createSubject({

                ...req.body,

                school_id: req.user.school_id

            });

        return response.success(
            res,
            subject,
            "Subject created successfully",
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
 * Get My Subjects (active only - for pickers)
 */
async function getSubjectsBySchool(req, res) {

    try {

        const subjects =
            await subjectService.getSubjectsBySchool(
                req.user.school_id
            );

        return response.success(
            res,
            subjects,
            "Subjects retrieved successfully"
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
 * Get All Subjects For Management (active + inactive)
 */
async function getAllSubjectsForManagement(req, res) {

    try {

        const subjects =
            await subjectService.getAllSubjectsForSchool(
                req.user.school_id
            );

        return response.success(
            res,
            subjects,
            "Subjects retrieved successfully"
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
 * Get Subject By ID
 */
async function getSubjectById(req, res) {

    try {

        const subject =
            await subjectService.getSubjectById(
                req.params.id,
                req.user.school_id
            );

        if (!subject) {

            return response.error(
                res,
                "Subject not found",
                404
            );

        }

        return response.success(
            res,
            subject,
            "Subject retrieved successfully"
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
 * Update Subject
 */
async function updateSubject(req, res) {

    try {

        const subject =
            await subjectService.updateSubject(
                req.params.id,
                req.user.school_id,
                req.body
            );

        if (!subject) {

            return response.error(
                res,
                "Subject not found",
                404
            );

        }

        return response.success(
            res,
            subject,
            "Subject updated successfully"
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
 * Deactivate Subject (soft delete)
 */
async function deactivateSubject(req, res) {

    try {

        const subject =
            await subjectService.deactivateSubject(
                req.params.id,
                req.user.school_id
            );

        if (!subject) {

            return response.error(
                res,
                "Subject not found",
                404
            );

        }

        return response.success(
            res,
            subject,
            "Subject deactivated successfully"
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
 * Reactivate Subject
 */
async function reactivateSubject(req, res) {

    try {

        const subject =
            await subjectService.reactivateSubject(
                req.params.id,
                req.user.school_id
            );

        if (!subject) {

            return response.error(
                res,
                "Subject not found",
                404
            );

        }

        return response.success(
            res,
            subject,
            "Subject reactivated successfully"
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

    createSubject,

    getSubjectsBySchool,

    getAllSubjectsForManagement,

    getSubjectById,

    updateSubject,

    deactivateSubject,

    reactivateSubject

};
