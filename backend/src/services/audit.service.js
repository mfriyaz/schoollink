const db = require("../config/database");

/**
 * Activity log. Every function here is "best effort" - a failure to
 * write a log row must never break the action being logged.
 */

function pad(n) {
    return String(n).padStart(2, "0");
}

function norm(value) {

    if (value === undefined || value === null || value === "") {
        return null;
    }

    if (value instanceof Date) {
        return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`;
    }

    if (Array.isArray(value)) {
        return value.length > 0 ? JSON.stringify(value) : null;
    }

    if (typeof value === "boolean") {
        return value ? "Yes" : "No";
    }

    const text = String(value);

    // ISO timestamps/dates -> just the day
    if (/^\d{4}-\d{2}-\d{2}T/.test(text)) {
        return text.slice(0, 10);
    }

    return text;

}

function display(value) {

    if (value === null) {
        return "(empty)";
    }

    if (value.startsWith("[") && value.endsWith("]")) {
        try {
            const arr = JSON.parse(value);
            return `${arr.length} file(s)`;
        } catch (e) {
            // fall through
        }
    }

    return value.length > 160 ? value.slice(0, 160) + "…" : value;

}

/**
 * Compare `before` (DB row) with `after` (request body) for the
 * given {field: "Label"} map. Fields missing from `after` are
 * treated as "not being changed".
 */
function diffFields(before, after, labels) {

    const changes = [];

    if (!before || !after) {
        return changes;
    }

    for (const key of Object.keys(labels)) {

        if (after[key] === undefined) {
            continue;
        }

        const from = norm(before[key]);
        const to = norm(after[key]);

        if (from !== to) {
            changes.push({
                field: labels[key],
                from: display(from),
                to: display(to)
            });
        }

    }

    return changes;

}

async function logAudit(req, entry) {

    try {

        const userResult = await db.query(
            `
            SELECT u.full_name, r.role_name
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            WHERE u.id = $1
            `,
            [req.user.id]
        );

        const user = userResult.rows[0] || {};

        await db.query(
            `
            INSERT INTO audit_logs
            (school_id, user_id, user_name, user_role, action,
             entity_type, entity_id, entity_title, summary, changes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            `,
            [
                req.user.school_id,
                req.user.id,
                user.full_name || null,
                user.role_name || req.user.role || null,
                entry.action,
                entry.entityType,
                entry.entityId || null,
                entry.entityTitle || null,
                entry.summary || null,
                entry.changes && entry.changes.length > 0
                    ? JSON.stringify(entry.changes)
                    : null
            ]
        );

    } catch (err) {

        console.error("Failed to write audit log:", err.message);

    }

}

/**
 * "Class 5-A - Mathematics" style label for a teacher_subjects row.
 */
async function describeTeacherSubject(teacherSubjectId) {

    try {

        const result = await db.query(
            `
            SELECT c.class_name, s.section_name, sub.subject_name
            FROM teacher_subjects ts
            LEFT JOIN classes c ON c.id = ts.class_id
            LEFT JOIN sections s ON s.id = ts.section_id
            LEFT JOIN subjects sub ON sub.id = ts.subject_id
            WHERE ts.id = $1
            `,
            [teacherSubjectId]
        );

        const r = result.rows[0];

        if (!r) {
            return null;
        }

        return `${r.class_name || ""}-${r.section_name || ""} · ${r.subject_name || ""}`;

    } catch (err) {
        return null;
    }

}

/**
 * "Term 1 · Mathematics · Class 5-A" label for an exam_subjects row.
 */
async function describeExamSubject(examSubjectId) {

    try {

        const result = await db.query(
            `
            SELECT e.exam_name, sub.subject_name, c.class_name, s.section_name
            FROM exam_subjects es
            JOIN exams e ON e.id = es.exam_id
            LEFT JOIN teacher_subjects ts ON ts.id = es.teacher_subject_id
            LEFT JOIN subjects sub ON sub.id = ts.subject_id
            LEFT JOIN classes c ON c.id = ts.class_id
            LEFT JOIN sections s ON s.id = ts.section_id
            WHERE es.id = $1
            `,
            [examSubjectId]
        );

        const r = result.rows[0];

        if (!r) {
            return null;
        }

        return `${r.exam_name} · ${r.subject_name || ""} · ${r.class_name || ""}-${r.section_name || ""}`;

    } catch (err) {
        return null;
    }

}

async function listAuditLogs(schoolId, filters) {

    const page = Math.max(parseInt(filters.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 20, 1), 100);

    const where = ["school_id = $1"];
    const values = [schoolId];

    function add(clause, value) {
        values.push(value);
        where.push(clause.replace("?", `$${values.length}`));
    }

    if (filters.search) {
        values.push(`%${filters.search}%`);
        const n = values.length;
        where.push(
            `(entity_title ILIKE $${n} OR user_name ILIKE $${n} OR summary ILIKE $${n})`
        );
    }

    if (filters.entity_type) add("entity_type = ?", filters.entity_type);
    if (filters.entity_id) add("entity_id = ?", parseInt(filters.entity_id, 10));
    if (filters.action) add("action = ?", filters.action);
    if (filters.role) add("user_role = ?", filters.role);
    if (filters.from) add("created_at >= ?::date", filters.from);
    if (filters.to) add("created_at < (?::date + INTERVAL '1 day')", filters.to);

    const whereSql = where.join(" AND ");

    const countResult = await db.query(
        `SELECT COUNT(*)::int AS total FROM audit_logs WHERE ${whereSql}`,
        values
    );

    const total = countResult.rows[0].total;

    const rows = await db.query(
        `
        SELECT *
        FROM audit_logs
        WHERE ${whereSql}
        ORDER BY created_at DESC, id DESC
        LIMIT ${limit} OFFSET ${(page - 1) * limit}
        `,
        values
    );

    return {
        logs: rows.rows,
        total,
        page,
        totalPages: Math.max(Math.ceil(total / limit), 1)
    };

}

module.exports = {
    logAudit,
    diffFields,
    describeTeacherSubject,
    describeExamSubject,
    listAuditLogs
};
