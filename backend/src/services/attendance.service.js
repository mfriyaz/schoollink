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

async function setAttendanceMode(schoolId, mode) {

    if (!attendanceModel.ATTENDANCE_MODES.includes(mode)) {
        throw httpError("Choose subject-wise, once a day, or morning and afternoon.", 400);
    }

    const before = await attendanceModel.getAttendanceMode(schoolId);

    await attendanceModel.setAttendanceMode(schoolId, mode);

    return { before, after: mode };

}

module.exports = {

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
