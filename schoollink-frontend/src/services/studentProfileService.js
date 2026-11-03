import api from "./api";

export async function getStudentProfile(studentId) {

    const response = await api.get(`/students/${studentId}/profile`);

    return response.data;

}
