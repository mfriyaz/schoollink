const sectionService = require("../services/section.service");
const response = require("../utils/response");

/**
 * Create Section
 */
async function createSection(req, res) {

    try {

        const newSection =
            await sectionService.createSection(req.body);

        return response.success(
            res,
            newSection,
            "Section created successfully",
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
 * Get Sections By Class
 */
async function getSectionsByClass(req, res) {

    try {

        const sections =
            await sectionService.getSectionsByClass(
                req.params.classId
            );

        return response.success(
            res,
            sections,
            "Sections retrieved successfully"
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
 * Get Section By ID
 */
async function getSectionById(req, res) {

    try {

        const section =
            await sectionService.getSectionById(
                req.params.id
            );

        if (!section) {

            return response.error(
                res,
                "Section not found",
                404
            );

        }

        return response.success(
            res,
            section,
            "Section retrieved successfully"
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
 * Update Section
 */
async function updateSection(req, res) {

    try {

        const updatedSection =
            await sectionService.updateSection(
                req.params.id,
                req.body
            );

        if (!updatedSection) {

            return response.error(
                res,
                "Section not found",
                404
            );

        }

        return response.success(
            res,
            updatedSection,
            "Section updated successfully"
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
 * Delete Section
 */
async function deleteSection(req, res) {

    try {

        const deletedSection =
            await sectionService.deleteSection(
                req.params.id
            );

        if (!deletedSection) {

            return response.error(
                res,
                "Section not found",
                404
            );

        }

        return response.success(
            res,
            deletedSection,
            "Section deleted successfully"
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

    createSection,

    getSectionsByClass,

    getSectionById,

    updateSection,

    deleteSection

};