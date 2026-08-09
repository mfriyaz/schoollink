const sectionService = require("../services/section.service");
const response = require("../utils/response");

/**
 * Create Section
 */
async function createSection(req, res) {

    try {

        const newSection =
            await sectionService.createSection({

                ...req.body,

                school_id: req.user.school_id

            });

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
 * Get Sections By Class (active only - for pickers)
 */
async function getSectionsByClass(req, res) {

    try {

        const sections =
            await sectionService.getSectionsByClass(
                req.params.classId,
                req.user.school_id
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
 * Get All Sections For Class For Management (active + inactive)
 */
async function getAllSectionsForClass(req, res) {

    try {

        const sections =
            await sectionService.getAllSectionsForClass(
                req.params.classId,
                req.user.school_id
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
                req.params.id,
                req.user.school_id
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
                req.user.school_id,
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
 * Deactivate Section (soft delete)
 */
async function deactivateSection(req, res) {

    try {

        const deletedSection =
            await sectionService.deactivateSection(
                req.params.id,
                req.user.school_id
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
            "Section deactivated successfully"
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
 * Reactivate Section
 */
async function reactivateSection(req, res) {

    try {

        const reactivatedSection =
            await sectionService.reactivateSection(
                req.params.id,
                req.user.school_id
            );

        if (!reactivatedSection) {

            return response.error(
                res,
                "Section not found",
                404
            );

        }

        return response.success(
            res,
            reactivatedSection,
            "Section reactivated successfully"
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

    getAllSectionsForClass,

    getSectionById,

    updateSection,

    deactivateSection,

    reactivateSection

};
