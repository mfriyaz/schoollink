const express = require("express");

const tenant = require("../middleware/tenantGuard");

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
    tenant.body("teacher_subject", "teacher_subject_id"),
    tenant.body("student", "student_id"),
    attendanceController.createAttendance
);

/**
 * Bulk Mark Attendance For A Whole Class
 */
router.post(
    "/bulk",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.body("teacher_subject", "teacher_subject_id"),
    tenant.bodyList("student", "records", "student_id"),
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
    tenant.param("teacher_subject", "teacherSubjectId"),
    attendanceController.getRosterWithAttendance
);

/**
 * Get Attendance By Date
 */
router.get(
    "/teacher-subject/:teacherSubjectId/date/:attendanceDate",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("teacher_subject", "teacherSubjectId"),
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
    tenant.param("student", "studentId"),
    attendanceController.getAttendanceByStudent
);

/**
 * Update Attendance
 */
router.put(
    "/:id",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("attendance", "id"),
    attendanceController.updateAttendance
);

/**
 * Delete Attendance
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("attendance", "id"),
    attendanceController.deleteAttendance
);

module.exports = router;
