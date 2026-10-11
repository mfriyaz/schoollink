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

export async function aiReportRemarks(studentId, examId, language) {
    return (await api.post("/ai/report-remarks", { student_id: studentId, exam_id: examId, language })).data;
}

export async function getWeeklySummary(studentId, language, refresh) {
    const params = { language };
    if (refresh) params.refresh = 1;
    return (await api.get(`/ai/weekly-summary/${studentId}`, { params })).data;
}

export async function getEarlyWarning(classId) {
    const params = classId ? { class_id: classId } : {};
    return (await api.get("/ai/early-warning", { params })).data;
}

export async function aiEarlyWarningNote(studentId) {
    return (await api.post("/ai/early-warning-note", { student_id: studentId })).data;
}
