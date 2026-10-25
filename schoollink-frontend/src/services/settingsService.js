import api from "./api";

export async function getMySettings() {

    const response = await api.get("/settings/me");

    return response.data;

}

export async function updateMySettings(data) {

    const response = await api.patch("/settings/me", data);

    return response.data;

}

export async function getAttendanceMode() {

    const response = await api.get("/settings/attendance-mode");

    return response.data;

}

export async function saveAttendanceMode(mode) {

    const response = await api.put("/settings/attendance-mode", { mode });

    return response.data;

}
