import api from "./api";

export async function getQuizForStudent(homeworkId, studentId) {

    const response = await api.get(`/quiz/homework/${homeworkId}/student/${studentId}`);

    return response.data;

}

export async function submitQuizAttempt(homeworkId, studentId, answers) {

    const response = await api.post(`/quiz/homework/${homeworkId}/student/${studentId}/attempt`, { answers });

    return response.data;

}

export async function getQuizForManage(homeworkId) {

    const response = await api.get(`/quiz/homework/${homeworkId}/manage`);

    return response.data;

}

export async function saveQuiz(homeworkId, payload) {

    const response = await api.put(`/quiz/homework/${homeworkId}`, payload);

    return response.data;

}

export async function removeQuiz(homeworkId) {

    const response = await api.delete(`/quiz/homework/${homeworkId}`);

    return response.data;

}

export async function getQuizResults(homeworkId) {

    const response = await api.get(`/quiz/homework/${homeworkId}/results`);

    return response.data;

}

export async function getQuizStudentDetail(homeworkId, studentId) {

    const response = await api.get(`/quiz/homework/${homeworkId}/results/student/${studentId}`);

    return response.data;

}
