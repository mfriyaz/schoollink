const classService = require("../services/class.service");
const response = require("../utils/response");

/**
 * Create Class
 */
async function createClass(req, res) {

    try {

        const newClass = await classService.createClass(req.body);

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
 * Get Classes By Academic Year
 */
async function getClassesByAcademicYear(req, res) {

    try {

        const classes =
            await classService.getClassesByAcademicYear(
                req.params.academicYearId
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
            await classService.getClassById(req.params.id);

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
                req.body
            );

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
 * Delete Class
 */
async function deleteClass(req, res) {

    try {

        const deletedClass =
            await classService.deleteClass(req.params.id);

        return response.success(
            res,
            deletedClass,
            "Class deleted successfully"
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

    getClassesByAcademicYear,

    getClassById,

    updateClass,

    deleteClass

};