import api from "./api";

export async function onboardSchool(data) {

    const response = await api.post("/platform/onboard-school", data);

    return response.data;

}
