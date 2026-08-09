import api from "./api";

/**
 * Create a new Exam
 */
export async function createExam(data) {

    const response = await api.post("/exams", data);

    return response.data;

}

/**
 * Get all exams for the school
 */
export async function getAllExams() {

    const response = await api.get("/exams");

    return response.data;

}

/**
 * Assign a subject (with max/pass marks) to an exam
 */
export async function assignSubjectToExam(data) {

    const response = await api.post("/exam-subjects", data);

    return response.data;

}

/**
 * Get every subject assigned to an exam
 */
export async function getSubjectsByExam(examId) {

    const response = await api.get(`/exam-subjects/exam/${examId}`);

    return response.data;

}

/**
 * Get all class/subject assignments for the school
 * (used to populate the "assign subject to exam" picker)
 */
export async function getSchoolAssignments() {

    const response = await api.get("/teacher-subjects/mine");

    return response.data;

}

/**
 * Get the class roster with any existing marks for an exam subject
 */
export async function getMarksRoster(examSubjectId) {

    const response = await api.get(`/student-marks/roster/${examSubjectId}`);

    return response.data;

}

/**
 * Bulk save marks for a whole class
 */
export async function bulkSaveMarks(data) {

    const response = await api.post("/student-marks/bulk", data);

    return response.data;

}

/**
 * Get a student's marks across all exams (Parent-accessible,
 * scoped to their own linked children on the backend)
 */
export async function getMarksForStudent(studentId) {

    const response = await api.get(`/student-marks/student/${studentId}`);

    return response.data;

}
