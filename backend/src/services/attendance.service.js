const attendanceModel = require("../models/attendance.model");

/**
 * Mark Attendance (single record)
 */
async function createAttendance(data) {

    return await attendanceModel.createAttendance(data);

}

/**
 * Get Attendance By Date
 */
async function getAttendanceByDate(teacherSubjectId, attendanceDate) {

    return await attendanceModel.getAttendanceByDate(
        teacherSubjectId,
        attendanceDate
    );

}

/**
 * Get Attendance By Student
 */
async function getAttendanceByStudent(studentId) {

    return await attendanceModel.getAttendanceByStudent(studentId);

}

/**
 * Update Attendance
 */
async function updateAttendance(id, data) {

    return await attendanceModel.updateAttendance(id, data);

}

/**
 * Delete Attendance
 */
async function deleteAttendance(id) {

    return await attendanceModel.deleteAttendance(id);

}

/**
 * Get Roster With Attendance
 */
async function getRosterWithAttendance(teacherSubjectId, attendanceDate, session = "Day") {

    return await attendanceModel.getRosterWithAttendance(
        teacherSubjectId,
        attendanceDate,
        session
    );

}

/**
 * Bulk Mark Attendance
 */
async function bulkMarkAttendance(teacherSubjectId, attendanceDate, records, session = "Day") {

    const today = new Date().toISOString().slice(0, 10);

    if (attendanceDate > today) {

        throw new Error("Attendance cannot be marked for a future date.");

    }

    return await attendanceModel.bulkUpsertAttendance(
        teacherSubjectId,
        attendanceDate,
        records,
        session
    );

}

/**
 * Verify Teacher Owns Assignment
 */
async function teacherOwnsAssignment(userId, teacherSubjectId) {

    return await attendanceModel.teacherOwnsAssignment(
        userId,
        teacherSubjectId
    );

}

/**
 * Verify Parent Owns Student
 */
async function parentOwnsStudent(userId, studentId) {

    return await attendanceModel.parentOwnsStudent(userId, studentId);

}

function httpError(message, status) {
    const err = new Error(message);
    err.status = status;
    return err;
}

/**
 * Work out which session a save/read belongs to, and check who may take it.
 *  - subject mode: always "Day", any assigned teacher (as before)
 *  - daily mode:   "Day", the class teacher only
 *  - half_day:     "Morning" or "Afternoon", the class teacher only
 * School Admins are allowed in every mode.
 */
async function resolveSession(user, teacherSubjectId, requestedSession) {

    const mode = await attendanceModel.getAttendanceMode(user.school_id);

    if (mode === "subject") return { mode, session: "Day" };

    if (user.role === "Teacher") {

        const isClassTeacher = await attendanceModel.isClassTeacherAssignment(teacherSubjectId);

        if (!isClassTeacher) {
            throw httpError("In this school attendance is taken by the class teacher only.", 403);
        }

    }

    if (mode === "daily") return { mode, session: "Day" };

    if (requestedSession !== "Morning" && requestedSession !== "Afternoon") {
        throw httpError("Choose Morning or Afternoon.", 400);
    }

    return { mode, session: requestedSession };

}

async function getAttendanceMode(schoolId) {
    return await attendanceModel.getAttendanceMode(schoolId);
}

async function getAttendanceEditDays(schoolId) {
    return await attendanceModel.getAttendanceEditDays(schoolId);
}

async function setAttendanceEditDays(schoolId, value) {

    let days = null;

    if (value !== null && value !== "" && value !== undefined) {

        days = Number(value);

        if (!Number.isInteger(days) || days < 0 || days > 60) {
            throw httpError("Choose a number of days between 0 and 60, or no limit.", 400);
        }

    }

    const before = await attendanceModel.getAttendanceEditDays(schoolId);

    await attendanceModel.setAttendanceEditDays(schoolId, days);

    return { before, after: days };

}

/**
 * A teacher may only mark or change attendance within the school's limit.
 * School Admin is never limited. Returns an error message, or null when allowed.
 */
async function editWindowProblem(user, dateInput) {

    if (!user || user.role !== "Teacher") return null;

    const limit = await attendanceModel.getAttendanceEditDays(user.school_id);

    if (limit === null) return null;

    const date = String(dateInput || "").slice(0, 10);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;

    const insights = require("./insights.service");

    const today = await insights.schoolToday(user.school_id);

    const back = Math.round((new Date(`${today}T00:00:00Z`) - new Date(`${date}T00:00:00Z`)) / 86400000);

    if (back <= limit) return null;

    return limit === 0
        ? "Teachers can only take attendance for today. Please ask the School Admin to change an earlier day."
        : `Teachers can only change attendance up to ${limit} ${limit === 1 ? "day" : "days"} back. Please ask the School Admin.`;

}

async function getAttendanceDate(id) {
    return await attendanceModel.getAttendanceDate(id);
}

async function setAttendanceMode(schoolId, mode) {

    if (!attendanceModel.ATTENDANCE_MODES.includes(mode)) {
        throw httpError("Choose subject-wise, once a day, or morning and afternoon.", 400);
    }

    const before = await attendanceModel.getAttendanceMode(schoolId);

    await attendanceModel.setAttendanceMode(schoolId, mode);

    return { before, after: mode };

}

/**
 * Compare what is being saved with what is already there.
 * Returns the students whose status changes, and whether the day was empty.
 */
async function describeSave(teacherSubjectId, attendanceDate, session, records) {

    const existing = await attendanceModel.getExistingForSave(teacherSubjectId, attendanceDate, session);

    const before = new Map(existing.map((r) => [Number(r.student_id), r]));

    const changes = [];

    // Students whose parents should be told: newly (or newly changed to) Absent / Late
    const alerts = [];

    (records || []).forEach((rec) => {

        const old = before.get(Number(rec.student_id));

        if ((rec.status === "Absent" || rec.status === "Late") && (!old || old.status !== rec.status)) {

            alerts.push({ student_id: Number(rec.student_id), status: rec.status });

        }

        if (old && old.status !== rec.status) {

            changes.push({
                field: `${old.first_name} ${old.last_name || ""}`.trim(),
                from: old.status,
                to: rec.status
            });

        }

    });

    return { hadRecords: existing.length > 0, changes, alerts };

}

async function getAssignmentLabel(teacherSubjectId) {
    return await attendanceModel.getAssignmentLabel(teacherSubjectId);
}

module.exports = {

    getAttendanceEditDays,

    setAttendanceEditDays,

    editWindowProblem,

    getAttendanceDate,

    describeSave,

    getAssignmentLabel,

    resolveSession,

    getAttendanceMode,

    setAttendanceMode,

    createAttendance,

    getAttendanceByDate,

    getAttendanceByStudent,

    updateAttendance,

    deleteAttendance,

    getRosterWithAttendance,

    bulkMarkAttendance,

    teacherOwnsAssignment,

    parentOwnsStudent

};
