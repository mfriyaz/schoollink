import api from "./api";

export async function getAttention(params) {

    const response = await api.get("/attention", { params });

    return response.data;

}

export async function addFollowup(studentId, note) {

    const response = await api.post(`/attention/${studentId}/followup`, { note });

    return response.data;

}
