import api from "./api";

/**
 * Get all students
 */
export async function getStudents(search = "") {

    const response = await api.get("/students", {

        params: {

            search

        }

    });

    return response.data;

}

/**
 * Get student by ID
 */
export async function getStudentById(id) {

    const response = await api.get(`/students/${id}`);

    return response.data;

}

/**
 * Create student
 */
export async function createStudent(data) {

    const response = await api.post("/students", data);

    return response.data;

}

/**
 * Update student
 */
export async function updateStudent(id, data) {

    const response = await api.put(`/students/${id}`, data);

    return response.data;

}

/**
 * Delete student
 */
export async function deleteStudent(id) {

    const response = await api.delete(`/students/${id}`);

    return response.data;

}