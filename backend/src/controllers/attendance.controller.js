const calendarService = require("../services/calendar.service");
const attendanceService = require("../services/attendance.service");
const response = require("../utils/response");
const auditService = require("../services/audit.service");
const insights = require("../services/insights.service");

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

        const dayStatus = await calendarService.getDayStatus(
            req.user.school_id,
            String(req.body.attendance_date).slice(0, 10)
        );

        if (!dayStatus.is_working) {

            return response.error(
                res,
                `Attendance can't be marked: ${String(req.body.attendance_date).slice(0, 10)} is ${calendarService.describeOffDay(dayStatus)}.`,
                400
            );

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

        const dayStatus = await calendarService.getDayStatus(
            req.user.school_id,
            String(attendance_date).slice(0, 10)
        );

        if (!dayStatus.is_working) {

            return response.error(
                res,
                `Attendance can't be marked: ${String(attendance_date).slice(0, 10)} is ${calendarService.describeOffDay(dayStatus)}. Ask the School Admin to add a Working Day in School Calendar if school is open.`,
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

        const { session } = await attendanceService.resolveSession(
            req.user,
            teacher_subject_id,
            req.body.session
        );

        // Work out what this save changes BEFORE it is saved
        const dateOnly = String(attendance_date).slice(0, 10);

        const diff = await attendanceService.describeSave(
            teacher_subject_id,
            dateOnly,
            session,
            records
        );

        const result = await attendanceService.bulkMarkAttendance(
            teacher_subject_id,
            attendance_date,
            records,
            session
        );

        // Activity log: changed attendance, or attendance entered for an earlier day
        try {

            const today = await insights.schoolToday(req.user.school_id);

            const label = await attendanceService.getAssignmentLabel(teacher_subject_id);

            const place = `${label.class_name || ""}-${label.section_name || ""}`
                + (session === "Day" ? "" : ` ${session}`);

            if (diff.changes.length > 0) {

                await auditService.logAudit(req, {
                    action: "Edited",
                    entityType: "attendance",
                    entityId: Number(teacher_subject_id),
                    entityTitle: `${place} on ${dateOnly}`,
                    summary: `Attendance changed for ${diff.changes.length} student${diff.changes.length === 1 ? "" : "s"}`
                        + (dateOnly < today ? " (an earlier day)" : ""),
                    changes: diff.changes.slice(0, 200)
                });

            } else if (dateOnly < today && !diff.hadRecords) {

                await auditService.logAudit(req, {
                    action: "Created",
                    entityType: "attendance",
                    entityId: Number(teacher_subject_id),
                    entityTitle: `${place} on ${dateOnly}`,
                    summary: `Attendance entered late for ${records.length} student${records.length === 1 ? "" : "s"} (an earlier day)`
                });

            }

        } catch (e) {

            console.error("Attendance log failed:", e.message);

        }

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
            err.status || 500
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

        const { session } = await attendanceService.resolveSession(
            req.user,
            teacherSubjectId,
            req.query.session
        );

        const roster = await attendanceService.getRosterWithAttendance(
            teacherSubjectId,
            attendanceDate,
            session
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
            err.status || 500
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
