const express = require("express");

const tenant = require("../middleware/tenantGuard");

const router = express.Router();

const quizController = require("../controllers/quiz.controller");

const { authenticate } = require("../middleware/auth.middleware");

const { authorizeRoles } = require("../middleware/role.middleware");

/**
 * Parent: the quiz for one child (questions only, no answers until they have tried)
 */
router.get(
    "/homework/:homeworkId/student/:studentId",
    authenticate,
    authorizeRoles("Parent"),
    tenant.param("homework", "homeworkId"),
    tenant.param("student", "studentId"),
    quizController.getForStudent
);

/**
 * Parent: hand in one try (marked on the server)
 */
router.post(
    "/homework/:homeworkId/student/:studentId/attempt",
    authenticate,
    authorizeRoles("Parent"),
    tenant.param("homework", "homeworkId"),
    tenant.param("student", "studentId"),
    quizController.submitAttempt
);

/**
 * Teacher / School Admin: full quiz with the correct answers
 */
router.get(
    "/homework/:homeworkId/manage",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("homework", "homeworkId"),
    tenant.teacherParam("homework", "homeworkId"),
    quizController.getForManage
);

router.put(
    "/homework/:homeworkId",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("homework", "homeworkId"),
    tenant.teacherParam("homework", "homeworkId"),
    quizController.saveQuiz
);

router.delete(
    "/homework/:homeworkId",
    authenticate,
    authorizeRoles("School Admin", "Teacher"),
    tenant.param("homework", "homeworkId"),
    tenant.teacherParam("homework", "homeworkId"),
    quizController.removeQuiz
);

module.exports = router;
