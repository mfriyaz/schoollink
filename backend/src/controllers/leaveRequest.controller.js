const response = require("../utils/response");
const service = require("../services/leaveRequest.service");

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

const create = handle(async (req, res) => {
    const data = await service.createRequest(req.user, req.body || {});
    return response.success(res, data, "Leave request sent", 201);
}, "Leave create");

const mine = handle(async (req, res) => {
    return response.success(res, await service.listMine(req.user), "My leave requests");
}, "Leave mine");

const cancel = handle(async (req, res) => {
    await service.cancelMine(req.user, Number(req.params.id));
    return response.success(res, null, "Leave request withdrawn");
}, "Leave cancel");

const list = handle(async (req, res) => {
    return response.success(res, await service.listForStaff(req.user, req.query.status), "Leave requests");
}, "Leave list");

const decide = handle(async (req, res) => {
    const body = req.body || {};
    await service.decide(req.user, Number(req.params.id), body.decision, body.note);
    return response.success(res, null, "Leave request updated");
}, "Leave decide");

module.exports = { create, mine, cancel, list, decide };
