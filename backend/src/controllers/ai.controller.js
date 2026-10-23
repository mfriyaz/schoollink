const response = require("../utils/response");
const ai = require("../services/ai.service");
const reportCardService = require("../services/reportCard.service");
const classTeacherService = require("../services/classTeacher.service");
const transferService = require("../services/assignmentTransfer.service");

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

async function homeworkDraft(req, res) {
    try {
        return response.success(res, await ai.homeworkDraft(req.user, req.body), "Done");
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

async function setClassTeacher(req, res) {
    try {
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) return response.error(res, "Invalid assignment.", 400);
        const value = req.body && req.body.is_class_teacher;
        if (typeof value !== "boolean") return response.error(res, "is_class_teacher must be true or false.", 400);
        const row = await classTeacherService.setClassTeacher(req.user.school_id, id, value);
        if (!row) return response.error(res, "Assignment not found.", 404);
        return response.success(res, row, value ? "Class teacher set" : "Class teacher removed");
    } catch (err) {
        console.error("setClassTeacher failed", err);
        return response.error(res, "Unable to update the class teacher.", 500);
    }
}

async function transferAssignment(req, res) {
    try {
        const id = Number(req.params.id);
        const teacherId = Number(req.body && req.body.teacher_id);
        if (!Number.isInteger(id) || !Number.isInteger(teacherId)) {
            return response.error(res, "Choose a teacher to transfer to.", 400);
        }
        const row = await transferService.transferAssignment(req.user.school_id, id, teacherId);
        return response.success(res, row, "Assignment transferred");
    } catch (err) {
        if (err instanceof transferService.TransferError) return response.error(res, err.message, err.status);
        console.error("transferAssignment failed", err);
        return response.error(res, "Unable to transfer this assignment.", 500);
    }
}

async function getSchoolAi(req, res) {
    try {
        return response.success(res, await ai.getSchoolUsage(Number(req.params.id)), "AI usage");
    } catch (err) { return fail(res, err); }
}

async function platformAiUsage(req, res) {
    try {
        return response.success(res, await ai.getPlatformUsage(), "AI usage");
    } catch (err) { return fail(res, err); }
}

async function updateSchoolAi(req, res) {
    try {
        return response.success(res, await ai.updateSchoolAi(Number(req.params.id), req.body || {}), "AI settings saved");
    } catch (err) { return fail(res, err); }
}

module.exports = { status, improve, translate, homeworkDraft, reportRemarks, weeklySummary, earlyWarning, earlyWarningNote, setClassTeacher, transferAssignment, getSchoolAi, updateSchoolAi, platformAiUsage };
