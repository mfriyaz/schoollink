const dashboardModel = require("../models/dashboard.model");

async function getDashboardSummary() {

    return await dashboardModel.getDashboardSummary();

}

module.exports = {

    getDashboardSummary

};