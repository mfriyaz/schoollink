const response = require("../utils/response");
const reportService = require("../services/attendanceReport.service");

/**
 * School Admin: attendance report for their own school. ?format=xlsx downloads it as Excel.
 */
async function getReport(req, res) {

    try {

        const report = await reportService.getReport(req.user.school_id, req.query);

        if (req.query.format === "xlsx") {

            const buffer = await reportService.buildWorkbook(report);

            res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");

            res.setHeader("Content-Disposition", `attachment; filename="attendance-${report.from}-to-${report.to}.xlsx"`);

            return res.send(Buffer.from(buffer));

        }

        return response.success(res, report, "Attendance report");

    } catch (err) {

        if (err.status === 400) return response.error(res, err.message, 400);

        console.error("Attendance report error:", err.message);

        return response.error(res, "Unable to build the attendance report.", 500);

    }

}

module.exports = { getReport };
