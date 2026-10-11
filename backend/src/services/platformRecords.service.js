const pool = require("../config/database");

/**
 * Read-only, per-school (tenant) record viewer for Super Admin.
 * Every query is hard-scoped to ONE school_id, and nothing here
 * writes to the school's data.
 */

const LIKE = (s) => `%${String(s || "").trim().replace(/[%_\\]/g, (c) => "\\" + c)}%`;

const types = {

    students: {
        from: `
            FROM students st
            LEFT JOIN classes c ON c.id = st.class_id
            LEFT JOIN sections sc ON sc.id = st.section_id
            WHERE st.school_id = $1
        `,
        search: `AND (st.first_name || ' ' || COALESCE(st.last_name,'') ILIKE $2
                      OR st.admission_no ILIKE $2
                      OR COALESCE(st.parent_phone,'') ILIKE $2)`,
        select: `
            SELECT st.id, st.admission_no,
                   TRIM(st.first_name || ' ' || COALESCE(st.last_name,'')) AS name,
                   st.gender, c.class_name, sc.section_name,
                   st.father_name, st.mother_name, st.parent_phone, st.parent_email,
                   (SELECT COUNT(*)::int FROM parent_students ps WHERE ps.student_id = st.id) AS parent_accounts,
                   st.is_active, st.created_at
        `,
        order: `ORDER BY c.class_order NULLS LAST, c.class_name, sc.section_name, st.first_name`
    },

    teachers: {
        from: `
            FROM teachers t
            LEFT JOIN users u ON u.id = t.user_id
            WHERE t.school_id = $1
        `,
        search: `AND (t.first_name || ' ' || COALESCE(t.last_name,'') ILIKE $2
                      OR COALESCE(t.email,'') ILIKE $2 OR COALESCE(t.employee_no,'') ILIKE $2)`,
        select: `
            SELECT t.id, t.employee_no,
                   TRIM(t.first_name || ' ' || COALESCE(t.last_name,'')) AS name,
                   t.email, t.phone, t.qualification,
                   to_char(t.joining_date, 'YYYY-MM-DD') AS joining_date,
                   (t.user_id IS NOT NULL) AS has_login,
                   u.username, u.last_login,
                   (SELECT COUNT(*)::int FROM teacher_subjects ts WHERE ts.teacher_id = t.id) AS assignments,
                   t.is_active
        `,
        order: `ORDER BY t.first_name`
    },

    parents: {
        from: `
            FROM users u
            JOIN roles r ON r.id = u.role_id AND r.role_name = 'Parent'
            WHERE u.school_id = $1
        `,
        search: `AND (u.full_name ILIKE $2 OR COALESCE(u.email,'') ILIKE $2
                      OR COALESCE(u.username,'') ILIKE $2 OR COALESCE(u.mobile,'') ILIKE $2)`,
        select: `
            SELECT u.id, u.full_name AS name, u.email, u.username, u.mobile,
                   u.is_active, u.last_login,
                   (SELECT string_agg(TRIM(st.first_name || ' ' || COALESCE(st.last_name,'')), ', ' ORDER BY st.first_name)
                      FROM parent_students ps JOIN students st ON st.id = ps.student_id
                      WHERE ps.parent_user_id = u.id) AS children
        `,
        order: `ORDER BY u.full_name`
    },

    classes: {
        from: `
            FROM classes c
            WHERE c.school_id = $1 AND c.is_active = true
        `,
        search: `AND c.class_name ILIKE $2`,
        select: `
            SELECT c.id, c.class_name,
                   (SELECT COUNT(*)::int FROM students st WHERE st.class_id = c.id AND st.is_active) AS students,
                   (SELECT COALESCE(json_agg(json_build_object(
                        'section', s.section_name,
                        'capacity', s.capacity,
                        'students', (SELECT COUNT(*)::int FROM students st WHERE st.section_id = s.id AND st.is_active),
                        'class_teacher', (SELECT TRIM(t.first_name || ' ' || COALESCE(t.last_name,'')) FROM teachers t WHERE t.id = s.class_teacher_id)
                    ) ORDER BY s.section_name), '[]'::json)
                    FROM sections s WHERE s.class_id = c.id AND s.is_active = true) AS sections
        `,
        order: `ORDER BY c.class_order NULLS LAST, c.class_name`
    },

    homework: {
        from: `
            FROM homework h
            JOIN teacher_subjects ts ON ts.id = h.teacher_subject_id
            LEFT JOIN subjects sj ON sj.id = ts.subject_id
            LEFT JOIN classes c ON c.id = ts.class_id
            LEFT JOIN sections sc ON sc.id = ts.section_id
            LEFT JOIN teachers t ON t.id = ts.teacher_id
            WHERE ts.school_id = $1
        `,
        search: `AND (h.title ILIKE $2 OR COALESCE(sj.subject_name,'') ILIKE $2
                      OR COALESCE(t.first_name,'') ILIKE $2)`,
        select: `
            SELECT h.id, h.title, sj.subject_name, c.class_name, sc.section_name,
                   TRIM(COALESCE(t.first_name,'') || ' ' || COALESCE(t.last_name,'')) AS teacher,
                   to_char(h.homework_date, 'YYYY-MM-DD') AS homework_date,
                   to_char(h.due_date, 'YYYY-MM-DD') AS due_date,
                   h.priority, h.is_active, h.created_at
        `,
        order: `ORDER BY h.created_at DESC`
    },

    announcements: {
        from: `
            FROM announcements a
            WHERE a.school_id = $1
        `,
        search: `AND (a.title ILIKE $2 OR COALESCE(a.description,'') ILIKE $2)`,
        select: `
            SELECT a.id, a.title, a.target_audience,
                   to_char(a.publish_date, 'YYYY-MM-DD') AS publish_date,
                   to_char(a.expiry_date, 'YYYY-MM-DD') AS expiry_date,
                   a.is_active, a.created_at
        `,
        order: `ORDER BY a.created_at DESC`
    },

    files: {
        from: `
            FROM uploaded_files f
            LEFT JOIN users u ON u.id = f.user_id
            WHERE f.school_id = $1
        `,
        search: `AND (COALESCE(f.filename,'') ILIKE $2 OR COALESCE(u.full_name,'') ILIKE $2 OR f.kind ILIKE $2)`,
        select: `
            SELECT f.id, f.filename, f.kind, f.bytes::float8 AS bytes, f.source,
                   u.full_name AS uploaded_by, f.created_at
        `,
        order: `ORDER BY f.bytes DESC`
    },

    activity: {
        from: `
            FROM audit_logs al
            WHERE al.school_id = $1
        `,
        search: `AND (COALESCE(al.summary,'') ILIKE $2 OR COALESCE(al.entity_title,'') ILIKE $2
                      OR COALESCE(al.user_name,'') ILIKE $2)`,
        select: `
            SELECT al.id, al.user_name, al.user_role, al.action, al.entity_type,
                   al.entity_title, al.summary, al.created_at
        `,
        order: `ORDER BY al.created_at DESC`
    },

    logins: {
        from: `
            FROM users u
            JOIN roles r ON r.id = u.role_id AND r.role_name <> 'Super Admin'
            WHERE u.school_id = $1
        `,
        search: `AND (u.full_name ILIKE $2 OR COALESCE(u.email,'') ILIKE $2 OR COALESCE(u.username,'') ILIKE $2)`,
        select: `
            SELECT u.id, u.full_name AS name, r.role_name AS role, u.email, u.username,
                   u.is_active, u.last_login, u.created_at
        `,
        order: `ORDER BY u.last_login DESC NULLS LAST, u.full_name`
    }

};

async function getAttendanceSummary(schoolId, days) {

    const result = await pool.query(
        `
        SELECT to_char(a.attendance_date, 'YYYY-MM-DD') AS date,
               a.status,
               COUNT(DISTINCT a.student_id)::int AS count
        FROM attendance a
        JOIN teacher_subjects ts ON ts.id = a.teacher_subject_id
        WHERE ts.school_id = $1
          AND a.attendance_date >= CURRENT_DATE - ($2::int * interval '1 day')
        GROUP BY 1, 2
        ORDER BY 1 DESC
        `,
        [schoolId, days]
    );

    const byDate = new Map();

    for (const r of result.rows) {

        if (!byDate.has(r.date)) byDate.set(r.date, { date: r.date, statuses: {}, total: 0 });

        const d = byDate.get(r.date);

        d.statuses[r.status] = r.count;
        d.total += r.count;

    }

    const rows = [...byDate.values()];

    return { rows, total: rows.length, page: 1, limit: rows.length };

}

async function getRecords(schoolId, type, { search, page, limit } = {}) {

    if (type === "attendance") {

        return getAttendanceSummary(schoolId, 30);

    }

    const cfg = types[type];

    if (!cfg) throw new Error("Unknown record type");

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    const params = [schoolId];

    let searchSql = "";

    if (search && String(search).trim()) {

        params.push(LIKE(search));
        searchSql = cfg.search;

    }

    const total = await pool.query(
        `SELECT COUNT(*)::int AS n ${cfg.from} ${searchSql}`,
        params
    );

    const rows = await pool.query(
        `${cfg.select} ${cfg.from} ${searchSql} ${cfg.order} LIMIT ${limitNum} OFFSET ${(pageNum - 1) * limitNum}`,
        params
    );

    return { rows: rows.rows, total: total.rows[0].n, page: pageNum, limit: limitNum };

}

module.exports = { getRecords, recordTypes: [...Object.keys(types), "attendance"] };
