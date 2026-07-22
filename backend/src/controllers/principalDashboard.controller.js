const principalDashboardService = require("../services/principalDashboard.service");

/**
 * Get Principal Dashboard
 */
async function getPrincipalDashboard(req, res) {

    try {

        const dashboard =
            await principalDashboardService.getPrincipalDashboard();

        return res.status(200).json({

            success: true,

            message: "Principal dashboard loaded successfully.",

            data: dashboard

        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({

            success: false,

            message: error.message

        });

    }

}

module.exports = {

    getPrincipalDashboard

};