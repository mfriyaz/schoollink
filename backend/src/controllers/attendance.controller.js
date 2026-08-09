const attendanceService = require("../services/attendance.service");
const response = require("../utils/response");

/**
 * Mark Attendance
 */
async function createAttendance(req, res) {

    try {

        // Admins can mark on behalf of any class; a Teacher can
        // only mark attendance for a class actually assigned to them.
        if (req.user.role === "Teacher") {

            const owns = await attendanceService.teacherOwnsAssignment(
                req.user.id,
                req.body.teacher_subject_id
            );

            if (!owns) {

                return response.error(
                    res,
                    "You are not assigned to this class/subject",
                    403
                );

            }

        }

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
 * Bulk Mark Attendance For A Whole Class
 */
async function bulkMarkAttendance(req, res) {

    try {

        const { teacher_subject_id, attendance_date, records } = req.body;

        if (!teacher_subject_id || !attendance_date || !Array.isArray(records)) {

            return response.error(
                res,
                "teacher_subject_id, attendance_date and records are required",
                400
            );

        }

        if (req.user.role === "Teacher") {

            const owns = await attendanceService.teacherOwnsAssignment(
                req.user.id,
                teacher_subject_id
            );

            if (!owns) {

                return response.error(
                    res,
                    "You are not assigned to this class/subject",
                    403
                );

            }

        }

        const result = await attendanceService.bulkMarkAttendance(
            teacher_subject_id,
            attendance_date,
            records
        );

        return response.success(
            res,
            result,
            "Attendance saved successfully",
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
 * Get Class Roster With Attendance For A Date
 */
async function getRosterWithAttendance(req, res) {

    try {

        const { teacherSubjectId, attendanceDate } = req.params;

        if (req.user.role === "Teacher") {

            const owns = await attendanceService.teacherOwnsAssignment(
                req.user.id,
                teacherSubjectId
            );

            if (!owns) {

                return response.error(
                    res,
                    "You are not assigned to this class/subject",
                    403
                );

            }

        }

        const roster = await attendanceService.getRosterWithAttendance(
            teacherSubjectId,
            attendanceDate
        );

        return response.success(
            res,
            roster,
            "Roster retrieved successfully"
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

        if (req.user.role === "Parent") {

            const owns = await attendanceService.parentOwnsStudent(
                req.user.id,
                req.params.studentId
            );

            if (!owns) {

                return response.error(
                    res,
                    "This student is not linked to your account",
                    403
                );

            }

        }

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

    bulkMarkAttendance,

    getRosterWithAttendance,

    getAttendanceByDate,

    getAttendanceByStudent,

    updateAttendance,

    deleteAttendance

};
