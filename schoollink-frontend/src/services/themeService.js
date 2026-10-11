import api from "./api";

export async function getSchoolTheme() {

    const response = await api.get("/settings/school-theme");

    return response.data;

}

export async function saveSchoolTheme(theme) {

    const response = await api.put("/settings/school-theme", { theme });

    return response.data;

}
