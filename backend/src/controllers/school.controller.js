const schoolService = require("../services/school.service");
const platformAdminService = require("../services/platformAdmin.service");
const { clearSchoolAccessCache } = require("../utils/schoolAccess");

/**
 * Update School Governance
 * (Super Admin only - subscription/status/limits)
 */
async function updateSchoolGovernance(req, res) {
    try {

        const before = await platformAdminService.getSubscriptionSnapshot(req.params.id);

        if (!before) {
            return res.status(404).json({
                success: false,
                message: "School not found"
            });
        }

        const reason = String(req.body.reason || "").trim();

        const incomingExpiry = req.body.subscription_expiry
            ? String(req.body.subscription_expiry).slice(0, 10)
            : null;

        // Changing the subscription duration must always be explained
        if (incomingExpiry !== before.subscription_expiry && !reason) {
            return res.status(400).json({
                success: false,
                message: "Please give a reason for changing the subscription expiry date."
            });
        }

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

        clearSchoolAccessCache();

        await platformAdminService.recordSubscriptionChange(
            req,
            { id: school.id },
            platformAdminService.diffSnapshots(
                before,
                await platformAdminService.getSubscriptionSnapshot(school.id)
            ),
            reason,
            "manual"
        );

        await platformAdminService.logActivity(
            req,
            { id: school.id, school_name: school.school_name },
            "governance",
            `Updated plan/status/limits for ${school.school_name} (plan ${school.subscription_plan}, status ${school.status}, expiry ${school.subscription_expiry ? String(school.subscription_expiry).slice(0, 10) : "none"})`
        );

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