import api from "./api";

export async function createTeacherSubjectAssignment(data) {

    const response = await api.post("/teacher-subjects", data);

    return response.data;

}

export async function getAssignmentsByTeacher(teacherId) {

    const response = await api.get(`/teacher-subjects/teacher/${teacherId}`);

    return response.data;

}

export async function deleteTeacherSubjectAssignment(id) {

    const response = await api.delete(`/teacher-subjects/${id}`);

    return response.data;

}
