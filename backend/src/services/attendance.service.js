const attendanceModel = require("../models/attendance.model");

/**
 * Mark Attendance
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

module.exports = {

    createAttendance,

    getAttendanceByDate,

    getAttendanceByStudent,

    updateAttendance,

    deleteAttendance

};