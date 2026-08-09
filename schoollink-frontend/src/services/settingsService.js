import api from "./api";

export async function getMySettings() {

    const response = await api.get("/settings/me");

    return response.data;

}

export async function updateMySettings(data) {

    const response = await api.patch("/settings/me", data);

    return response.data;

}
