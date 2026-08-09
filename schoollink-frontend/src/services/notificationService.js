import api from "./api";

export async function getMyNotifications() {

    const response = await api.get("/notifications/me");

    return response.data;

}

export async function getUnreadCount() {

    const response = await api.get("/notifications/me/unread-count");

    return response.data;

}

export async function markAsRead(id) {

    const response = await api.patch(`/notifications/${id}/read`);

    return response.data;

}

export async function markAllAsRead() {

    const response = await api.patch("/notifications/me/read-all");

    return response.data;

}
