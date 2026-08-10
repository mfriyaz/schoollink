const teacherService = require("../services/teacher.service");
const response = require("../utils/response");
const { assertUnderLimit } = require("../utils/schoolLimits");

/**
 * Create Teacher
 */
async function createTeacher(req, res) {

    try {

        await assertUnderLimit(req.user.school_id, "teachers");

        const teacher =
            await teacherService.createTeacher({

                ...req.body,

                school_id: req.user.school_id

            });

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
 * Add a login to an existing teacher who doesn't have one yet
 */
async function addLoginToExistingTeacher(req, res) {

    try {

        const { id } = req.params;

        const { email, temporary_password } = req.body;

        if (!email || !temporary_password) {

            return response.error(
                res,
                "email and temporary_password are required",
                400
            );

        }

        const teacher = await teacherService.addLoginToExistingTeacher(

            id,

            req.user.school_id,

            email,

            temporary_password

        );

        return response.success(
            res,
            teacher,
            "Login added successfully"
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
 * (self-scoped from the JWT, not a client-supplied ID)
 */
async function getTeachersBySchool(req, res) {

    try {

        const teachers =
            await teacherService.getTeachersBySchool(
                req.user.school_id
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
                req.params.id,
                req.user.school_id
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
 * Get My Teacher Profile
 * (self-lookup: resolves the logged-in Teacher's user id
 * from the JWT into their teacher_id)
 */
async function getMyTeacherProfile(req, res) {

    try {

        const teacher =
            await teacherService.getTeacherByUserId(
                req.user.id
            );

        if (!teacher) {

            return response.error(
                res,
                "No teacher profile linked to this account",
                404
            );

        }

        return response.success(
            res,
            teacher,
            "Teacher profile retrieved successfully"
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
                req.user.school_id,
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
 * Deactivate Teacher (soft delete)
 */
async function deactivateTeacher(req, res) {

    try {

        const teacher =
            await teacherService.deactivateTeacher(
                req.params.id,
                req.user.school_id
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
            "Teacher deactivated successfully"
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
 * Reactivate Teacher
 */
async function reactivateTeacher(req, res) {

    try {

        const teacher =
            await teacherService.reactivateTeacher(
                req.params.id,
                req.user.school_id
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
            "Teacher reactivated successfully"
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

    addLoginToExistingTeacher,

    getTeachersBySchool,

    getTeacherById,

    getMyTeacherProfile,

    updateTeacher,

    deactivateTeacher,

    reactivateTeacher

};
