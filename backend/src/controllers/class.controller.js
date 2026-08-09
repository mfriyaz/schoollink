const classService = require("../services/class.service");
const response = require("../utils/response");
const { assertUnderLimit } = require("../utils/schoolLimits");

/**
 * Create Class
 */
async function createClass(req, res) {

    try {

        await assertUnderLimit(req.user.school_id, "classes");

        const newClass = await classService.createClass({

            ...req.body,

            school_id: req.user.school_id

        });

        return response.success(
            res,
            newClass,
            "Class created successfully",
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
 * Get My Classes (active only - for pickers)
 */
async function getMyClasses(req, res) {

    try {

        const classes =
            await classService.getClassesBySchool(
                req.user.school_id
            );

        return response.success(
            res,
            classes,
            "Classes retrieved successfully"
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
 * Get All Classes For Management (active + inactive)
 */
async function getAllClassesForManagement(req, res) {

    try {

        const classes =
            await classService.getAllClassesForSchool(
                req.user.school_id
            );

        return response.success(
            res,
            classes,
            "Classes retrieved successfully"
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
 * Get Classes By Academic Year
 */
async function getClassesByAcademicYear(req, res) {

    try {

        const classes =
            await classService.getClassesByAcademicYear(
                req.params.academicYearId,
                req.user.school_id
            );

        return response.success(
            res,
            classes,
            "Classes retrieved successfully"
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
 * Get Class By ID
 */
async function getClassById(req, res) {

    try {

        const classData =
            await classService.getClassById(
                req.params.id,
                req.user.school_id
            );

        if (!classData) {

            return response.error(
                res,
                "Class not found",
                404
            );

        }

        return response.success(
            res,
            classData,
            "Class retrieved successfully"
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
 * Update Class
 */
async function updateClass(req, res) {

    try {

        const updatedClass =
            await classService.updateClass(
                req.params.id,
                req.user.school_id,
                req.body
            );

        if (!updatedClass) {

            return response.error(
                res,
                "Class not found",
                404
            );

        }

        return response.success(
            res,
            updatedClass,
            "Class updated successfully"
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
 * Deactivate Class (soft delete)
 */
async function deactivateClass(req, res) {

    try {

        const deletedClass =
            await classService.deactivateClass(
                req.params.id,
                req.user.school_id
            );

        if (!deletedClass) {

            return response.error(
                res,
                "Class not found",
                404
            );

        }

        return response.success(
            res,
            deletedClass,
            "Class deactivated successfully"
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
 * Reactivate Class
 */
async function reactivateClass(req, res) {

    try {

        const reactivatedClass =
            await classService.reactivateClass(
                req.params.id,
                req.user.school_id
            );

        if (!reactivatedClass) {

            return response.error(
                res,
                "Class not found",
                404
            );

        }

        return response.success(
            res,
            reactivatedClass,
            "Class reactivated successfully"
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

    createClass,

    getMyClasses,

    getAllClassesForManagement,

    getClassesByAcademicYear,

    getClassById,

    updateClass,

    deactivateClass,

    reactivateClass

};
