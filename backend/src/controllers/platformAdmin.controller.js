const service = require("../services/platformAdmin.service");
const response = require("../utils/response");

function wrap(fn) {

    return async (req, res) => {

        try {

            await fn(req, res);

        } catch (err) {

            return response.error(res, err.message, 400);

        }

    };

}

const overview = wrap(async (req, res) => {

    return response.success(res, await service.getOverview());

});

const listSchools = wrap(async (req, res) => {

    return response.success(res, await service.listSchools());

});

const schoolDetail = wrap(async (req, res) => {

    const data = await service.getSchoolDetail(req.params.id);

    if (!data) return response.error(res, "School not found", 404);

    return response.success(res, data);

});

const setStatus = wrap(async (req, res) => {

    const ok = await service.setStatus(req, req.params.id, req.body.status, req.body.reason);

    if (!ok) return response.error(res, "School not found", 404);

    return response.success(res, null, "Status updated");

});

const addPayment = wrap(async (req, res) => {

    const row = await service.addPayment(req, req.params.id, req.body);

    if (!row) return response.error(res, "School not found", 404);

    return response.success(res, row, "Payment recorded", 201);

});

const deletePayment = wrap(async (req, res) => {

    const ok = await service.deletePayment(req, req.params.paymentId);

    if (!ok) return response.error(res, "Payment not found", 404);

    return response.success(res, null, "Payment deleted");

});

const listPayments = wrap(async (req, res) => {

    return response.success(res, await service.listPayments(req.query));

});

const updateNotes = wrap(async (req, res) => {

    const ok = await service.updateNotes(req, req.params.id, req.body.notes);

    if (!ok) return response.error(res, "School not found", 404);

    return response.success(res, null, "Notes saved");

});

const resetAdminPassword = wrap(async (req, res) => {

    const temp = await service.resetSchoolAdminPassword(req, req.params.userId);

    if (!temp) return response.error(res, "School Admin not found", 404);

    return response.success(res, { temporary_password: temp }, "Password reset successfully");

});

module.exports = {
    overview, listSchools, schoolDetail, setStatus, addPayment,
    deletePayment, listPayments, updateNotes, resetAdminPassword
};
