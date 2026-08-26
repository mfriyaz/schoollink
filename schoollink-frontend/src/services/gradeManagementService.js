import api from "./api";

export async function getAllGrades() {

    const response = await api.get("/grades");

    return response.data;

}

export async function createGrade(data) {

    const response = await api.post("/grades", data);

    return response.data;

}

export async function updateGrade(id, data) {

    const response = await api.put(`/grades/${id}`, data);

    return response.data;

}

export async function deleteGrade(id) {

    const response = await api.delete(`/grades/${id}`);

    return response.data;

}
