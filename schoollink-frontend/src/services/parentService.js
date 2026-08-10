import api from "./api";

export async function createOrLinkParent(data) {

    const response = await api.post("/parents", data);

    return response.data;

}

export async function getParentsForStudent(studentId) {

    const response = await api.get(`/parents/student/${studentId}`);

    return response.data;

}
