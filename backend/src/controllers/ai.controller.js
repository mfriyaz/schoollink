const response = require("../utils/response");
const ai = require("../services/ai.service");
const reportCardService = require("../services/reportCard.service");

function fail(res, err) {
    if (err instanceof ai.AiError) return response.error(res, err.message, err.status);
    console.error("AI controller error", err);
    return response.error(res, "Something went wrong. Please try again.", 500);
}

async function status(req, res) {
    try {
        return response.success(res, await ai.getStatus(req.user.school_id), "AI status");
    } catch (err) { return fail(res, err); }
}

async function improve(req, res) {
    try {
        const { action, text } = req.body || {};
        return response.success(res, await ai.improve(req.user, action, text), "Done");
    } catch (err) { return fail(res, err); }
}

async function translate(req, res) {
    try {
        const { language, text } = req.body || {};
        return response.success(res, await ai.translate(req.user, language, text), "Done");
    } catch (err) { return fail(res, err); }
}

async function reportRemarks(req, res) {
    try {
        const { student_id, exam_id, language } = req.body || {};
        return response.success(res, await ai.reportRemarks(req.user, student_id, exam_id, language), "Done");
    } catch (err) { return fail(res, err); }
}

async function weeklySummary(req, res) {
    try {
        const sid = Number(req.params.studentId);
        const ok = await reportCardService.parentOwnsStudent(req.user.id, sid);
        if (!ok) return response.error(res, "You cannot view this student.", 403);
        const { language, refresh } = req.query || {};
        return response.success(res, await ai.weeklySummary(req.user, sid, language, refresh === "1"), "Weekly summary");
    } catch (err) { return fail(res, err); }
}

async function earlyWarning(req, res) {
    try {
        return response.success(res, await ai.earlyWarning(req.user, req.query.class_id), "Early warning");
    } catch (err) { return fail(res, err); }
}

async function earlyWarningNote(req, res) {
    try {
        const { student_id } = req.body || {};
        return response.success(res, await ai.earlyWarningNote(req.user, student_id), "Done");
    } catch (err) { return fail(res, err); }
}

async function getSchoolAi(req, res) {
    try {
        return response.success(res, await ai.getSchoolUsage(Number(req.params.id)), "AI usage");
    } catch (err) { return fail(res, err); }
}

async function updateSchoolAi(req, res) {
    try {
        return response.success(res, await ai.updateSchoolAi(Number(req.params.id), req.body || {}), "AI settings saved");
    } catch (err) { return fail(res, err); }
}

module.exports = { status, improve, translate, reportRemarks, weeklySummary, earlyWarning, earlyWarningNote, getSchoolAi, updateSchoolAi };
