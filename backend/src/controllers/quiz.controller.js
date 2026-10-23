const quizService = require("../services/quiz.service");
const response = require("../utils/response");
const auditService = require("../services/audit.service");
const quizModel = require("../models/quiz.model");

function fail(res, err) {

    if (err instanceof quizService.QuizError) return response.error(res, err.message, err.status);

    console.error("Quiz error:", err.message);

    return response.error(res, "Something went wrong. Please try again.", 500);

}

async function getForStudent(req, res) {
    try {
        const data = await quizService.getForStudent(req.user, req.params.homeworkId, req.params.studentId);
        return response.success(res, data, "Quiz retrieved");
    } catch (err) { return fail(res, err); }
}

async function submitAttempt(req, res) {
    try {
        const data = await quizService.submitAttempt(
            req.user,
            req.params.homeworkId,
            req.params.studentId,
            req.body && req.body.answers
        );
        return response.success(res, data, "Quiz marked", 201);
    } catch (err) { return fail(res, err); }
}

async function getForManage(req, res) {
    try {
        const data = await quizService.getForManage(req.params.homeworkId);
        return response.success(res, data, "Quiz retrieved");
    } catch (err) { return fail(res, err); }
}

async function getResults(req, res) {
    try {
        const data = await quizService.getResults(req.params.homeworkId);
        return response.success(res, data, "Quiz results retrieved");
    } catch (err) { return fail(res, err); }
}

async function getStudentDetail(req, res) {
    try {
        const data = await quizService.getStudentDetail(req.params.homeworkId, req.params.studentId);
        return response.success(res, data, "Quiz answers retrieved");
    } catch (err) { return fail(res, err); }
}

async function saveQuiz(req, res) {
    try {
        const data = await quizService.saveQuiz(req.params.homeworkId, req.user.school_id, req.body);
        return response.success(res, data, "Quiz saved", 201);
    } catch (err) { return fail(res, err); }
}

async function removeQuiz(req, res) {
    try {
        const title = await quizModel.getHomeworkTitle(req.params.homeworkId);
        const out = await quizService.removeQuiz(req.params.homeworkId, req.body && req.body.confirm);
        if (out.existed) {
            await auditService.logAudit(req, {
                action: "Deleted",
                entityType: "homework",
                entityId: Number(req.params.homeworkId),
                entityTitle: title,
                summary: out.attempts > 0
                    ? `Practice quiz removed (${out.attempts} ${out.attempts === 1 ? "try" : "tries"} deleted)`
                    : "Practice quiz removed"
            });
        }
        return response.success(res, null, "Quiz removed");
    } catch (err) { return fail(res, err); }
}

async function setClosed(req, res) {
    try {
        const closed = Boolean(req.body && req.body.closed);
        const data = await quizService.setClosed(req.params.homeworkId, closed);
        await auditService.logAudit(req, {
            action: "Edited",
            entityType: "homework",
            entityId: Number(req.params.homeworkId),
            entityTitle: await quizModel.getHomeworkTitle(req.params.homeworkId),
            summary: closed ? "Practice quiz closed" : "Practice quiz reopened"
        });
        return response.success(res, data, closed ? "Quiz closed" : "Quiz reopened");
    } catch (err) { return fail(res, err); }
}

module.exports = { getForStudent, submitAttempt, getForManage, setClosed, getResults, getStudentDetail, saveQuiz, removeQuiz };
