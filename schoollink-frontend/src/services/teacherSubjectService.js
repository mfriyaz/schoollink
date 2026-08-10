import api from "./api";

export async function createTeacherSubjectAssignment(data) {

    const response = await api.post("/teacher-subjects", data);

    return response.data;

}
