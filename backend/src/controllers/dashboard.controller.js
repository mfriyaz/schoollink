const dashboardService = require("../services/dashboard.service");
const response = require("../utils/response");
const asyncHandler = require("../middleware/asyncHandler");

const getDashboard = asyncHandler(async (req, res) => {

    const dashboard = await dashboardService.getDashboardSummary();

    return response.success(

        res,

        dashboard,

        "Dashboard loaded successfully"

    );

});

module.exports = {

    getDashboard

};