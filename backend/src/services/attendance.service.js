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
async function getRosterWithAttendance(teacherSubjectId, attendanceDate) {

    return await attendanceModel.getRosterWithAttendance(
        teacherSubjectId,
        attendanceDate
    );

}

/**
 * Bulk Mark Attendance
 */
async function bulkMarkAttendance(teacherSubjectId, attendanceDate, records) {

    return await attendanceModel.bulkUpsertAttendance(
        teacherSubjectId,
        attendanceDate,
        records
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

module.exports = {

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
