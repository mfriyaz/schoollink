const parentDashboardService = require("../services/parentDashboard.service");

/**
 * Get Parent Dashboard
 */
async function getParentDashboard(req, res) {

    try {

        /*
         * For now we are passing studentId
         * from URL.
         *
         * Later after Parent Login
         * we will get studentId
         * from JWT Token.
         */

        const { studentId } = req.params;

        const dashboard =
            await parentDashboardService.getParentDashboard(
                studentId
            );

        return res.status(200).json({

            success: true,

            message: "Parent dashboard loaded successfully.",

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

    getParentDashboard

};