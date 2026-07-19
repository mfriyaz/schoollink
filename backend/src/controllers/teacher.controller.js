const teacherService = require("../services/teacher.service");
const response = require("../utils/response");

/**
 * Create Teacher
 */
async function createTeacher(req, res) {

    try {

        const teacher =
            await teacherService.createTeacher(req.body);

        return response.success(
            res,
            teacher,
            "Teacher created successfully",
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
 * Get Teachers By School
 */
async function getTeachersBySchool(req, res) {

    try {

        const teachers =
            await teacherService.getTeachersBySchool(
                req.params.schoolId
            );

        return response.success(
            res,
            teachers,
            "Teachers retrieved successfully"
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
 * Get Teacher By ID
 */
async function getTeacherById(req, res) {

    try {

        const teacher =
            await teacherService.getTeacherById(
                req.params.id
            );

        if (!teacher) {

            return response.error(
                res,
                "Teacher not found",
                404
            );

        }

        return response.success(
            res,
            teacher,
            "Teacher retrieved successfully"
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
 * Update Teacher
 */
async function updateTeacher(req, res) {

    try {

        const teacher =
            await teacherService.updateTeacher(
                req.params.id,
                req.body
            );

        if (!teacher) {

            return response.error(
                res,
                "Teacher not found",
                404
            );

        }

        return response.success(
            res,
            teacher,
            "Teacher updated successfully"
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
 * Delete Teacher
 */
async function deleteTeacher(req, res) {

    try {

        const teacher =
            await teacherService.deleteTeacher(
                req.params.id
            );

        if (!teacher) {

            return response.error(
                res,
                "Teacher not found",
                404
            );

        }

        return response.success(
            res,
            teacher,
            "Teacher deleted successfully"
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

    createTeacher,

    getTeachersBySchool,

    getTeacherById,

    updateTeacher,

    deleteTeacher

};