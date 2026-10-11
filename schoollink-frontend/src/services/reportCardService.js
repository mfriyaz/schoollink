import api from "./api";

export async function getReportCard(studentId, examId) {

    const response = await api.get(
        `/report-cards/student/${studentId}/exam/${examId}`
    );

    return response.data;

}

export async function downloadReportCardPdf(studentId, examId) {

    const response = await api.get(
        `/report-cards/student/${studentId}/exam/${examId}/pdf`,
        { responseType: "blob" }
    );

    return response.data;

}

export async function saveReportRemarks(studentId, examId, remarks, aiAssisted) {

    const response = await api.put(
        `/report-cards/student/${studentId}/exam/${examId}/remarks`,
        { remarks, ai_assisted: !!aiAssisted }
    );

    return response.data;

}

export async function getStudentRemarks(studentId) {

    const response = await api.get(`/report-cards/student/${studentId}/remarks`);

    return response.data;

}
