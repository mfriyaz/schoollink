const express = require("express");

const router = express.Router();

const attendanceController =
    require("../controllers/attendance.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Mark Attendance (single record)
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    attendanceController.createAttendance
);

/**
 * Bulk Mark Attendance For A Whole Class
 */
router.post(
    "/bulk",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    attendanceController.bulkMarkAttendance
);

/**
 * Get Class Roster With Attendance For A Date
 * (used by the Take Attendance screen)
 */
router.get(
    "/roster/:teacherSubjectId/:attendanceDate",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    attendanceController.getRosterWithAttendance
);

/**
 * Get Attendance By Date
 */
router.get(
    "/teacher-subject/:teacherSubjectId/date/:attendanceDate",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    attendanceController.getAttendanceByDate
);

/**
 * Get Attendance By Student
 * (Parent role can now view their own child's history too)
 */
router.get(
    "/student/:studentId",
    authenticate,
    authorizeRoles("School Admin", "Teacher", "Parent"),
    attendanceController.getAttendanceByStudent
);

/**
 * Update Attendance
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    attendanceController.updateAttendance
);

/**
 * Delete Attendance
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    attendanceController.deleteAttendance
);

module.exports = router;
