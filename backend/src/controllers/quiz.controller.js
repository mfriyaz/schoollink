const quizService = require("../services/quiz.service");
const response = require("../utils/response");

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
        await quizService.removeQuiz(req.params.homeworkId);
        return response.success(res, null, "Quiz removed");
    } catch (err) { return fail(res, err); }
}

module.exports = { getForStudent, submitAttempt, getForManage, getResults, getStudentDetail, saveQuiz, removeQuiz };
