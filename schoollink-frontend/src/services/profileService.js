import api from "./api";

/**
 * Get the logged-in user's own profile
 */
export async function getMyProfile() {

    const response = await api.get("/profile/me");

    return response.data;

}

/**
 * Update the logged-in user's editable profile fields
 */
export async function updateMyProfile(data) {

    const response = await api.patch("/profile/me", data);

    return response.data;

}

/**
 * Change the logged-in user's password
 */
export async function changePassword(data) {

    const response = await api.post("/profile/change-password", data);

    return response.data;

}
