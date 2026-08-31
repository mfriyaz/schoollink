import api from "./api";

export async function submitHomeworkPhoto(data) {

    const response = await api.post("/homework-submissions", data);

    return response.data;

}

export async function getSubmission(homeworkId, studentId) {

    const response = await api.get(
        `/homework-submissions/homework/${homeworkId}/student/${studentId}`
    );

    return response.data;

}

export async function getSubmissionsByHomework(homeworkId) {

    const response = await api.get(
        `/homework-submissions/homework/${homeworkId}`
    );

    return response.data;

}

export async function getSharedSubmissions(homeworkId) {

    const response = await api.get(
        `/homework-submissions/homework/${homeworkId}/shared`
    );

    return response.data;

}

export async function getSubmissionCount(homeworkId) {

    const response = await api.get(
        `/homework-submissions/homework/${homeworkId}/count`
    );

    return response.data;

}

export async function reactToSubmission(submissionId, reaction, homeworkId) {

    const response = await api.patch(
        `/homework-submissions/${submissionId}/react`,
        { reaction, homework_id: homeworkId }
    );

    return response.data;

}
