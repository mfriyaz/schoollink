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

export async function getSchoolAssignments() {

    const response = await api.get("/teacher-subjects/mine");

    return response.data;

}

export async function setClassTeacherFlag(id, isClassTeacher) {

    const response = await api.patch(`/ai/assignments/${id}/class-teacher`, { is_class_teacher: isClassTeacher });

    return response.data;

}

export async function transferAssignmentToTeacher(id, teacherId) {

    const response = await api.patch(`/ai/assignments/${id}/transfer`, { teacher_id: teacherId });

    return response.data;

}
