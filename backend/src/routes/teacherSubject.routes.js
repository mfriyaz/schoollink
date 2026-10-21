const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const teacherSubjectController =
    require("../controllers/teacherSubject.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Assign Teacher
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.body("teacher", "teacher_id"),
    tenant.body("subject", "subject_id"),
    tenant.body("class", "class_id"),
    tenant.body("section", "section_id"),
    teacherSubjectController.createAssignment
);

/**
 * Get Assignments By School
 * (self-scoped from the JWT, not a client-supplied ID)
 */
router.get(
    "/mine",
    authenticate,
    authorizeRoles("School Admin"),
    teacherSubjectController.getAssignmentsBySchool
);

/**
 * Get Assignments By Teacher
 * (Teacher role needs this to populate their own
 * Class/Subject dropdowns on Create Post)
 */
router.get(
    "/teacher/:teacherId",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("teacher", "teacherId"),
    tenant.teacherParam("teacher", "teacherId"),
    teacherSubjectController.getAssignmentsByTeacher
);

/**
 * Get Assignment By ID
 */
router.get(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("teacher_subject", "id"),
    teacherSubjectController.getAssignmentById
);

/**
 * End Assignment (keeps history)
 */
router.patch(
    "/:id/end",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("teacher_subject", "id"),
    teacherSubjectController.endAssignment
);

/**
 * Delete Assignment
 */
router.delete(
    "/:id",
    authenticate,
    authorizeRoles("School Admin"),
    tenant.param("teacher_subject", "id"),
    teacherSubjectController.deleteAssignment
);

module.exports = router;