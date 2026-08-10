const teacherSubjectService = require("../services/teacherSubject.service");
const response = require("../utils/response");

/**
 * Assign Teacher to Subject
 */
async function createAssignment(req, res) {

    try {

        const assignment =
            await teacherSubjectService.createAssignment({

                ...req.body,

                school_id: req.user.school_id

            });

        return response.success(
            res,
            assignment,
            "Teacher assigned successfully",
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
 * Get Assignments By School
 */
async function getAssignmentsBySchool(req, res) {

    try {

        const assignments =
            await teacherSubjectService.getAssignmentsBySchool(
                req.user.school_id
            );

        return response.success(
            res,
            assignments,
            "Assignments retrieved successfully"
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
 * Get Assignments By Teacher
 */
async function getAssignmentsByTeacher(req, res) {

    try {

        const assignments =
            await teacherSubjectService.getAssignmentsByTeacher(
                req.params.teacherId
            );

        return response.success(
            res,
            assignments,
            "Assignments retrieved successfully"
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
 * Get Assignment By ID
 */
async function getAssignmentById(req, res) {

    try {

        const assignment =
            await teacherSubjectService.getAssignmentById(
                req.params.id
            );

        if (!assignment) {

            return response.error(
                res,
                "Assignment not found",
                404
            );

        }

        return response.success(
            res,
            assignment,
            "Assignment retrieved successfully"
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
 * Delete Assignment
 */
async function deleteAssignment(req, res) {

    try {

        const assignment =
            await teacherSubjectService.deleteAssignment(
                req.params.id
            );

        if (!assignment) {

            return response.error(
                res,
                "Assignment not found",
                404
            );

        }

        return response.success(
            res,
            assignment,
            "Assignment deleted successfully"
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

    createAssignment,

    getAssignmentsBySchool,

    getAssignmentsByTeacher,

    getAssignmentById,

    deleteAssignment

};