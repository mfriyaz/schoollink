const schoolService = require("../services/school.service");

/**
 * Update School Governance
 * (Super Admin only - subscription/status/limits)
 */
async function updateSchoolGovernance(req, res) {
    try {

        const school = await schoolService.updateSchoolGovernance(
            req.params.id,
            req.body
        );

        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found"
            });
        }

        return res.json({
            success: true,
            message: "School governance updated successfully",
            data: school
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
}

/**
 * Create School
 */
async function createSchool(req, res) {
    try {

        const school = await schoolService.createSchool(req.body);

        return res.status(201).json({
            success: true,
            message: "School created successfully",
            data: school
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
}

/**
 * Get All Schools
 */
async function getAllSchools(req, res) {
    try {

        const schools = await schoolService.getAllSchools();

        return res.json({
            success: true,
            data: schools
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
}

/**
 * Get School By ID
 */
async function getSchoolById(req, res) {
    try {

        const school = await schoolService.getSchoolById(req.params.id);

        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found"
            });
        }

        return res.json({
            success: true,
            data: school
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
}

/**
 * Update School
 */
async function updateSchool(req, res) {
    try {

        const school = await schoolService.updateSchool(
            req.params.id,
            req.body
        );

        if (!school) {
            return res.status(404).json({
                success: false,
                message: "School not found"
            });
        }

        return res.json({
            success: true,
            message: "School updated successfully",
            data: school
        });

    } catch (err) {

        return res.status(500).json({
            success: false,
            message: err.message
        });

    }
}

/**
 * Delete School
 */
async function deleteSchool(req, res) {
    try {

        const school = await schoolService.deleteSchool(req.params.id);

        return res.json({
            success: true,
            message: "School deleted successfully",
            data: school
        });

    } catch (err) {

        return res.status(404).json({
            success: false,
            message: err.message
        });

    }
}

module.exports = {
    createSchool,
    getAllSchools,
    getSchoolById,
    updateSchool,
    updateSchoolGovernance,
    deleteSchool
};