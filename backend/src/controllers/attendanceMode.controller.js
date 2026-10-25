const response = require("../utils/response");
const attendanceService = require("../services/attendance.service");
const auditService = require("../services/audit.service");

const LABELS = { subject: "By subject", daily: "Once a day", half_day: "Morning and afternoon" };

/**
 * School Admin / Teacher: how this school takes attendance
 */
async function getAttendanceMode(req, res) {

    try {

        const mode = await attendanceService.getAttendanceMode(req.user.school_id);

        return response.success(res, { mode }, "Attendance mode");

    } catch (err) {

        return response.success(res, { mode: "subject" }, "Attendance mode");

    }

}

/**
 * School Admin only: change it for their own school
 */
async function updateAttendanceMode(req, res) {

    try {

        const r = await attendanceService.setAttendanceMode(
            req.user.school_id,
            (req.body || {}).mode
        );

        if (r.before !== r.after) {

            await auditService.logAudit(req, {
                action: "Edited",
                entityType: "Attendance mode",
                entityId: req.user.school_id,
                entityTitle: "How attendance is taken",
                summary: `Attendance mode changed from "${LABELS[r.before]}" to "${LABELS[r.after]}"`
            });

        }

        return response.success(res, { mode: r.after }, "Attendance mode saved");

    } catch (err) {

        if (err.status === 400) return response.error(res, err.message, 400);

        console.error("Attendance mode error", err);

        return response.error(res, "Unable to save. Please try again.", 500);

    }

}

module.exports = { getAttendanceMode, updateAttendanceMode };
