import api from "./api";

/** The school's current academic year */
export async function getCurrentYear() {

    const response = await api.get("/academic-years/current");

    return response.data;

}

/** All years of this school, newest first */
export async function getMyYears() {

    const response = await api.get("/academic-years/mine");

    return response.data;

}

/** Start a new year and move students up (saved together) */
export async function startNewYear(data) {

    const response = await api.post("/academic-years/rollover", data);

    return response.data;

}
