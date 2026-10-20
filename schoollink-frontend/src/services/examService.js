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
export async function getAllExams(includeArchived = false) {

    const response = await api.get(includeArchived ? "/exams?include_archived=1" : "/exams");

    return response.data;

}

/**
 * Edit an exam's name and dates
 */
export async function updateExam(id, data) {

    const response = await api.put(`/exams/${id}`, data);

    return response.data;

}

/**
 * Delete an exam (only works while no marks are entered)
 */
export async function deleteExam(id) {

    const response = await api.delete(`/exams/${id}`);

    return response.data;

}

/**
 * Archive (hide) or restore an exam
 */
export async function setExamArchived(id, archived) {

    const response = await api.patch(`/exams/${id}/archived`, { archived });

    return response.data;

}

/**
 * Change max / pass marks of a subject in an exam
 */
export async function updateExamSubject(id, data) {

    const response = await api.put(`/exam-subjects/${id}`, data);

    return response.data;

}

/**
 * Remove a subject from an exam (only while no marks are entered)
 */
export async function deleteExamSubject(id) {

    const response = await api.delete(`/exam-subjects/${id}`);

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

    const response = await api.get("/teacher-subjects/mine?include_ended=1");

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
