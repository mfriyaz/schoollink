import api from "./api";

/**
 * Get all students (supports search)
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
 * Create new student
 */
export async function createStudent(student) {

    const response = await api.post(
        "/students",
        student
    );

    return response.data;

}

/**
 * Update student
 */
export async function updateStudent(id, student) {

    const response = await api.put(
        `/students/${id}`,
        student
    );

    return response.data;

}

/**
 * Delete student
 */
export async function deleteStudent(id) {

    const response = await api.delete(
        `/students/${id}`
    );

    return response.data;

}

/**
 * Get students by class
 */
export async function getStudentsByClass(classId) {

    const response = await api.get(
        `/students/class/${classId}`
    );

    return response.data;

}

/**
 * Get students by section
 */
export async function getStudentsBySection(sectionId) {

    const response = await api.get(
        `/students/section/${sectionId}`
    );

    return response.data;

}