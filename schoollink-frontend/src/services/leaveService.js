import api from "./api";

export async function requestLeave(data) {

    const response = await api.post("/leave-requests", data);

    return response.data;

}

export async function getMyLeave() {

    const response = await api.get("/leave-requests/mine");

    return response.data;

}

export async function withdrawLeave(id) {

    const response = await api.delete(`/leave-requests/${id}`);

    return response.data;

}

export async function getLeaveRequests(status) {

    const response = await api.get("/leave-requests", { params: status ? { status } : {} });

    return response.data;

}

export async function decideLeave(id, decision, note) {

    const response = await api.patch(`/leave-requests/${id}/decision`, { decision, note });

    return response.data;

}
