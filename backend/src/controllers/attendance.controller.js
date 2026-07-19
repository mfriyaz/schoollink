const attendanceService = require("../services/attendance.service");
const response = require("../utils/response");

/**
 * Mark Attendance
 */
async function createAttendance(req, res) {

    try {

        const attendance =
            await attendanceService.createAttendance(req.body);

        return response.success(
            res,
            attendance,
            "Attendance marked successfully",
            201
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get Attendance By Date
 */
async function getAttendanceByDate(req, res) {

    try {

        const attendance =
            await attendanceService.getAttendanceByDate(
                req.params.teacherSubjectId,
                req.params.attendanceDate
            );

        return response.success(
            res,
            attendance,
            "Attendance retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Get Attendance By Student
 */
async function getAttendanceByStudent(req, res) {

    try {

        const attendance =
            await attendanceService.getAttendanceByStudent(
                req.params.studentId
            );

        return response.success(
            res,
            attendance,
            "Student attendance retrieved successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Update Attendance
 */
async function updateAttendance(req, res) {

    try {

        const attendance =
            await attendanceService.updateAttendance(
                req.params.id,
                req.body
            );

        if (!attendance) {

            return response.error(
                res,
                "Attendance record not found",
                404
            );

        }

        return response.success(
            res,
            attendance,
            "Attendance updated successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

/**
 * Delete Attendance
 */
async function deleteAttendance(req, res) {

    try {

        const attendance =
            await attendanceService.deleteAttendance(
                req.params.id
            );

        if (!attendance) {

            return response.error(
                res,
                "Attendance record not found",
                404
            );

        }

        return response.success(
            res,
            attendance,
            "Attendance deleted successfully"
        );

    } catch (err) {

        return response.error(
            res,
            err.message,
            500
        );

    }

}

module.exports = {

    createAttendance,

    getAttendanceByDate,

    getAttendanceByStudent,

    updateAttendance,

    deleteAttendance

};