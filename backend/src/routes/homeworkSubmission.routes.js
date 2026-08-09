const express = require("express");

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
    homeworkSubmissionController.submitHomework
);

/**
 * Get a specific student's submission
 */
router.get(
    "/homework/:homeworkId/student/:studentId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher", "Parent"),
    homeworkSubmissionController.getSubmission
);

/**
 * Get just the submission count for a homework post
 */
router.get(
    "/homework/:homeworkId/count",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    homeworkSubmissionController.getSubmissionCount
);

/**
 * Get every submission for a homework post (Teacher/Admin view)
 */
router.get(
    "/homework/:homeworkId",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    homeworkSubmissionController.getSubmissionsByHomework
);

/**
 * Teacher reacts to (and marks reviewed) a submission
 */
router.patch(
    "/:submissionId/react",
    authenticate,
    authorizeRoles("Super Admin", "School Admin", "Teacher"),
    homeworkSubmissionController.reactToSubmission
);

module.exports = router;
