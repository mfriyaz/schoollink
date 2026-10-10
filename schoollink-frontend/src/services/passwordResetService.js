import api from "./api";

export async function resetUserPassword(userId) {

    const response = await api.post(`/users/${userId}/reset-password`);

    return response.data;

}
