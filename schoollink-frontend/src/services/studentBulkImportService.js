import api from "./api";

/**
 * Download the Excel import template. Returns a Blob for the
 * caller to trigger a file download with.
 */
export async function downloadStudentTemplate() {

    const response = await api.get("/students/template", {

        responseType: "blob"

    });

    return response.data;

}

/**
 * Upload an Excel file of students for bulk import.
 */
export async function bulkUploadStudents(file) {

    const formData = new FormData();

    formData.append("file", file);

    // Content-Type must be left for the browser to set itself -
    // it needs to include the multipart boundary, which a fixed
    // string here would override and break server-side parsing.
    const response = await api.post("/students/bulk-upload", formData, {

        headers: { "Content-Type": undefined }

    });

    return response.data;

}
