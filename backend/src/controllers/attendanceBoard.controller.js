const response = require("../utils/response");
const boardService = require("../services/attendanceBoard.service");

/**
 * School Admin: live attendance board for their own school (date optional, YYYY-MM-DD)
 */
async function getBoard(req, res) {

    try {

        const data = await boardService.getBoard(req.user.school_id, req.query.date);

        return response.success(res, data, "Attendance board");

    } catch (err) {

        console.error("Attendance board error:", err.message);

        return response.error(res, "Unable to load the attendance board.", 500);

    }

}

module.exports = { getBoard };
