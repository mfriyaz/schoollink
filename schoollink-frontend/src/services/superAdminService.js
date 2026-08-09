import api from "./api";

export async function getAllSchools() {

    const response = await api.get("/schools");

    return response.data;

}

export async function updateSchoolGovernance(id, data) {

    const response = await api.patch(`/schools/${id}/governance`, data);

    return response.data;

}
