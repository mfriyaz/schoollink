import api from "./api";

export async function getAiStatus() {
    return (await api.get("/ai/status")).data;
}

export async function aiImprove(action, text) {
    return (await api.post("/ai/improve", { action, text })).data;
}

export async function aiTranslate(language, text) {
    return (await api.post("/ai/translate", { language, text })).data;
}

export async function getSchoolAi(id) {
    return (await api.get(`/platform/schools/${id}/ai`)).data;
}

export async function saveSchoolAi(id, payload) {
    return (await api.put(`/platform/schools/${id}/ai`, payload)).data;
}
