const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const homeworkSubmissionController = require("../controllers/homeworkSubmission.controller");

const {
    authenticate
} = require("../middleware/auth.middleware");

const {
    authorizeRoles
} = require("../middleware/role.middleware");

/**
 * Submit (or resubmit) a homework photo
 */
router.post(
    "/",
    authenticate,
    authorizeRoles("Parent"),
    tenant.body("homework", "homework_id"),
    tenant.body("student", "student_id"),
    homeworkSubmissionController.submitHomework
);

/**
 * Get a specific student's submission
 */
router.get(
    "/homework/:homeworkId/student/:studentId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher", "Parent"),
    tenant.param("homework", "homeworkId"),
    tenant.param("student", "studentId"),
    homeworkSubmissionController.getSubmission
);

/**
 * Get just the submission count for a homework post
 */
router.get(
    "/homework/:homeworkId/count",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    tenant.param("homework", "homeworkId"),
    homeworkSubmissionController.getSubmissionCount
);

/**
 * Get every submission for a homework post (Teacher/Admin view)
 */
router.get(
    "/homework/:homeworkId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    tenant.param("homework", "homeworkId"),
    homeworkSubmissionController.getSubmissionsByHomework
);

/**
 * Get every submission for a homework post, for a Parent -
 * only when the teacher enabled shared viewing for that post
 */
router.get(
    "/homework/:homeworkId/shared",
    authenticate,
    authorizeRoles("Parent"),
    tenant.param("homework", "homeworkId"),
    homeworkSubmissionController.getSubmissionsForParentView
);

/**
 * Teacher reacts to (and marks reviewed) a submission
 */
router.patch(
    "/:submissionId/react",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    tenant.param("submission", "submissionId"),
    homeworkSubmissionController.reactToSubmission
);

/**
 * Teacher lets a parent change a reviewed submission again
 */
router.patch(
    "/:submissionId/unlock",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    tenant.param("submission", "submissionId"),
    homeworkSubmissionController.unlockSubmission
);

module.exports = router;
