import api from "./api";

export async function getAllClassesForManagement() {

    const response = await api.get("/classes/manage/all");

    return response.data;

}

export async function createClassRecord(data) {

    const response = await api.post("/classes", data);

    return response.data;

}

export async function updateClassRecord(id, data) {

    const response = await api.put(`/classes/${id}`, data);

    return response.data;

}

export async function deactivateClassRecord(id) {

    const response = await api.delete(`/classes/${id}`);

    return response.data;

}

export async function reactivateClassRecord(id) {

    const response = await api.patch(`/classes/${id}/reactivate`);

    return response.data;

}

export async function getAllSectionsForClass(classId) {

    const response = await api.get(`/sections/class/${classId}/manage`);

    return response.data;

}

export async function createSectionRecord(data) {

    const response = await api.post("/sections", data);

    return response.data;

}

export async function updateSectionRecord(id, data) {

    const response = await api.put(`/sections/${id}`, data);

    return response.data;

}

export async function deactivateSectionRecord(id) {

    const response = await api.delete(`/sections/${id}`);

    return response.data;

}

export async function reactivateSectionRecord(id) {

    const response = await api.patch(`/sections/${id}/reactivate`);

    return response.data;

}
