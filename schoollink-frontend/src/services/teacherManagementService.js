import api from "./api";

export async function getMyTeachers() {

    const response = await api.get("/teachers/mine");

    return response.data;

}

export async function createTeacherRecord(data) {

    const response = await api.post("/teachers", data);

    return response.data;

}

export async function updateTeacherRecord(id, data) {

    const response = await api.put(`/teachers/${id}`, data);

    return response.data;

}

export async function deactivateTeacherRecord(id) {

    const response = await api.delete(`/teachers/${id}`);

    return response.data;

}

export async function reactivateTeacherRecord(id) {

    const response = await api.patch(`/teachers/${id}/reactivate`);

    return response.data;

}

export async function addLoginToExistingTeacher(id, data) {

    const response = await api.patch(`/teachers/${id}/add-login`, data);

    return response.data;

}
