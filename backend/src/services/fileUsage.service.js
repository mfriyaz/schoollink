const pool = require("../config/database");

function kindOf(mimetype, filename) {

    const m = String(mimetype || "").toLowerCase();
    const ext = String(filename || "").toLowerCase().split(".").pop();

    if (m.startsWith("image/") || ["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) return "image";
    if (m.startsWith("audio/") || m.startsWith("video/") || ["mp3", "m4a", "wav", "ogg", "webm", "aac", "mp4"].includes(ext)) return "audio";
    if (m === "application/pdf" || ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt"].includes(ext)) return "document";

    return "other";

}

/**
 * Remember an uploaded file against its school so the Super Admin
 * can see storage per school. Never throws: tracking must never
 * make an upload fail.
 */
async function recordUpload({ schoolId, userId, url, filename, mimetype, bytes }) {

    if (!schoolId || !url) return;

    try {

        await pool.query(
            `
            INSERT INTO uploaded_files
                (school_id, user_id, url, filename, kind, mimetype, bytes, source)
            VALUES ($1, $2, $3, $4, $5, $6, $7, 'upload')
            ON CONFLICT (url) DO NOTHING
            `,
            [schoolId, userId || null, url, filename || null, kindOf(mimetype, filename), mimetype || null, bytes || 0]
        );

    } catch (err) {

        console.error("[file-usage] could not record upload:", err.message);

    }

}

module.exports = { recordUpload, kindOf };
