const response = require("../utils/response");
const ai = require("../services/ai.service");

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

module.exports = { status, improve, translate, getSchoolAi, updateSchoolAi };
