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
