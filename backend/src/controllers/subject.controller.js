const subjectService = require("../services/subject.service");
const response = require("../utils/response");

/**
 * Create Subject
 */
async function createSubject(req, res) {

    try {

        const subject =
            await subjectService.createSubject(req.body);

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
 * Get Subjects By School
 */
async function getSubjectsBySchool(req, res) {

    try {

        const subjects =
            await subjectService.getSubjectsBySchool(
                req.params.schoolId
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
                req.params.id
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
 * Delete Subject
 */
async function deleteSubject(req, res) {

    try {

        const subject =
            await subjectService.deleteSubject(
                req.params.id
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
            "Subject deleted successfully"
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

    getSubjectById,

    updateSubject,

    deleteSubject

};