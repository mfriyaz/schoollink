const response = require("../utils/response");
const service = require("../services/attention.service");

function handle(fn, label) {
    return async (req, res) => {
        try {
            return await fn(req, res);
        } catch (err) {
            if (err.status) return response.error(res, err.message, err.status);
            console.error(`${label} error:`, err.message);
            return response.error(res, "Something went wrong. Please try again.", 500);
        }
    };
}

const list = handle(async (req, res) => response.success(res, await service.list(req.user, req.query), "Students needing attention"), "Attention list");

const addFollowup = handle(async (req, res) => {
    const data = await service.addFollowup(req.user, Number(req.params.studentId), (req.body || {}).note);
    return response.success(res, data, "Follow-up saved", 201);
}, "Attention follow-up");

module.exports = { list, addFollowup };
