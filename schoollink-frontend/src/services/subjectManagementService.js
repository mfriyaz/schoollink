import api from "./api";

export async function getAllSubjectsForManagement() {

    const response = await api.get("/subjects/manage/all");

    return response.data;

}

export async function createSubjectRecord(data) {

    const response = await api.post("/subjects", data);

    return response.data;

}

export async function updateSubjectRecord(id, data) {

    const response = await api.put(`/subjects/${id}`, data);

    return response.data;

}

export async function deactivateSubjectRecord(id) {

    const response = await api.delete(`/subjects/${id}`);

    return response.data;

}

export async function reactivateSubjectRecord(id) {

    const response = await api.patch(`/subjects/${id}/reactivate`);

    return response.data;

}
