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
 * Mark Attendance
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    attendanceController.createAttendance
);

/**
 * Get Attendance By Date
 */
router.get(
    "/teacher-subject/:teacherSubjectId/date/:attendanceDate",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    attendanceController.getAttendanceByDate
);

/**
 * Get Attendance By Student
 */
router.get(
    "/student/:studentId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    attendanceController.getAttendanceByStudent
);

/**
 * Update Attendance
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    attendanceController.updateAttendance
);

/**
 * Delete Attendance
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("Super Admin", "School Admin"),
    attendanceController.deleteAttendance
);

module.exports = router;