const dashboardService = require("../services/dashboard.service");

async function getDashboard(req, res) {

    try {

        const dashboard =
            await dashboardService.getDashboardSummary(
                req.user.school_id
            );

        res.json({

            success: true,

            message: "Dashboard loaded successfully",

            data: dashboard

        });

    }

    catch (err) {

        console.error(err);

        res.status(500).json({

            success: false,

            message: "Dashboard loading failed"

        });

    }

}

module.exports = {

    getDashboard

};
