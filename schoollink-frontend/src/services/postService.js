import api from "./api";

/**
 * Get logged-in Teacher's own profile
 * (resolves users.id -> teachers.id)
 */
export async function getMyTeacherProfile() {

    const response = await api.get("/teachers/me");

    return response.data;

}

/**
 * Get a teacher's assigned Class/Subject combinations
 * (used to populate the Create Post dropdowns)
 */
export async function getMyAssignments(teacherId) {

    const response = await api.get(
        `/teacher-subjects/teacher/${teacherId}`
    );

    return response.data;

}

/**
 * Get homework posts for a given class/subject assignment
 */
export async function getHomeworkByAssignment(teacherSubjectId) {

    const response = await api.get(
        `/homework/teacher-subject/${teacherSubjectId}`
    );

    return response.data;

}

/**
 * Get the logged-in Parent's children
 */
export async function getMyChildren() {

    const response = await api.get("/parents/me/children");

    return response.data;

}

/**
 * Get homework feed for a specific child
 * (includes each post's acknowledged/pending status for that child)
 */
export async function getHomeworkForStudent(studentId) {

    const response = await api.get(
        `/homework/student/${studentId}`
    );

    return response.data;

}

/**
 * Get all posts (homework + announcements), searchable and
 * filterable, for the All Posts page (Admin only)
 */
export async function getAllPosts({ search, type, page } = {}) {

    const response = await api.get("/posts", {

        params: { search, type, page }

    });

    return response.data;

}

/**
 * Upload a post attachment (PDF or image, max 10MB)
 */
export async function uploadAttachment(file) {

    const formData = new FormData();

    formData.append("attachment", file);

    // Content-Type must be left for the browser to set itself -
    // it needs to include the multipart boundary, which a fixed
    // string here would override and break server-side parsing.
    const response = await api.post("/uploads", formData, {

        headers: { "Content-Type": undefined }

    });

    return response.data;

}

/**
 * Get a child's attendance history (Parent-accessible,
 * scoped to their own linked children on the backend)
 */
export async function getAttendanceForStudent(studentId) {

    const response = await api.get(`/attendance/student/${studentId}`);

    return response.data;

}

/**
 * Get class roster with any existing attendance for a date
 */
export async function getAttendanceRoster(teacherSubjectId, date) {

    const response = await api.get(
        `/attendance/roster/${teacherSubjectId}/${date}`
    );

    return response.data;

}

/**
 * Bulk save attendance for a whole class
 */
export async function bulkMarkAttendance(data) {

    const response = await api.post("/attendance/bulk", data);

    return response.data;

}

/**
 * Create a Homework post
 */
export async function createHomeworkPost(data) {

    const response = await api.post("/homework", data);

    return response.data;

}

export async function getHomeworkById(id) {

    const response = await api.get(`/homework/${id}`);

    return response.data;

}

export async function updateHomeworkPost(id, data) {

    const response = await api.put(`/homework/${id}`, data);

    return response.data;

}

/**
 * Get the acknowledgement summary for a homework post
 * (total/acknowledged/pending counts + per-student status)
 */
export async function getHomeworkAckSummary(homeworkId) {

    const response = await api.get(
        `/acknowledgements/homework/${homeworkId}/summary`
    );

    return response.data;

}

/**
 * Create an Announcement (Admin only)
 */
export async function createAnnouncement(data) {

    const response = await api.post("/announcements", data);

    return response.data;

}

/**
 * Get expired announcements (School Admin only) - for a
 * dedicated "Expired" view separate from the main list
 */
export async function getExpiredAnnouncements() {

    const response = await api.get("/announcements/expired");

    return response.data;

}

/**
 * Get the Admin's school's classes
 * (for the announcement class-picker)
 */
export async function getMyClasses() {

    const response = await api.get("/classes/mine");

    return response.data;

}

/**
 * Get sections for a specific class
 * (used by the Student form's class -> section picker)
 */
export async function getSectionsByClass(classId) {

    const response = await api.get(`/sections/class/${classId}`);

    return response.data;

}

/**
 * Get announcements feed for a specific child
 * (includes that child's acknowledged/pending status)
 */
export async function getAnnouncementsForStudent(studentId) {

    const response = await api.get(
        `/acknowledgements/announcement/student/${studentId}`
    );

    return response.data;

}

/**
 * Submit a Parent's acknowledgement of a post
 */
export async function acknowledgePost(data) {

    const response = await api.post("/acknowledgements", data);

    return response.data;

}
