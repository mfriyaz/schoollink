import api from "./api";

export async function getPlatformOverview() {
    return (await api.get("/platform/overview")).data;
}

export async function getPlatformSchools() {
    return (await api.get("/platform/schools")).data;
}

export async function getPlatformSchool(id) {
    return (await api.get(`/platform/schools/${id}`)).data;
}

export async function setSchoolStatus(id, status, reason) {
    return (await api.post(`/platform/schools/${id}/status`, { status, reason })).data;
}

export async function addSchoolPayment(id, payload) {
    return (await api.post(`/platform/schools/${id}/payments`, payload)).data;
}

export async function deleteSchoolPayment(paymentId) {
    return (await api.delete(`/platform/payments/${paymentId}`)).data;
}

export async function getPlatformPayments(params) {
    return (await api.get("/platform/payments", { params })).data;
}

export async function saveSchoolNotes(id, notes) {
    return (await api.patch(`/platform/schools/${id}/notes`, { notes })).data;
}

export async function resetSchoolAdminPassword(userId) {
    return (await api.post(`/platform/school-admins/${userId}/reset-password`)).data;
}

export async function getSchoolRecords(id, type, params) {
    return (await api.get(`/platform/schools/${id}/records/${type}`, { params })).data;
}
