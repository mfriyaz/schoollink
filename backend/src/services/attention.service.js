const pool = require("../config/database");
const insights = require("./insights.service");

const HIDE_DAYS = 14;

function fail(message, status = 400) {
    const err = new Error(message);
    err.status = status;
    return err;
}

/** Which problems a student is flagged for, so a follow-up hides only that exact situation */
function signatureOf(item) {
    const types = (item.flags || []).map((f) => f.type).sort().join(",");
    return `${types}|${(item.metrics && item.metrics.latest_exam) || ""}`;
}

/** [{class_id, section_id}] the user is class teacher of (null = whole school) */
async function scopeFor(user) {

    if (user.role !== "Teacher") return null;

    const r = await pool.query(
        `SELECT DISTINCT ts.class_id, ts.section_id
           FROM teacher_subjects ts JOIN teachers t ON t.id = ts.teacher_id
          WHERE t.user_id = $1 AND t.school_id = $2 AND ts.is_class_teacher = true AND ts.ended_at IS NULL`,
        [user.id, user.school_id]
    );

    return r.rows;

}

const inScope = (scope, item) => scope === null || scope.some((c) => c.class_id === item.class_id && c.section_id === item.section_id);

/**
 * Students needing attention, with their latest follow-up.
 * open: not followed up in the last 14 days for the same problems.
 * query: { class_id, show ("all" includes followed-up students), limit }
 */
async function list(user, query = {}) {

    const scope = await scopeFor(user);

    const data = await insights.getEarlyWarnings(user.school_id, { classId: query.class_id });

    let items = data.items.filter((i) => inScope(scope, i));

    const ids = items.map((i) => i.student_id);

    const fu = ids.length
        ? await pool.query(
            `SELECT DISTINCT ON (f.student_id) f.student_id, f.note, f.signature, f.created_at, u.full_name AS by_name,
                    (f.created_at > CURRENT_TIMESTAMP - ($2 || ' days')::interval) AS recent
               FROM student_followups f LEFT JOIN users u ON u.id = f.user_id
              WHERE f.student_id = ANY($1::int[])
              ORDER BY f.student_id, f.created_at DESC`,
            [ids, String(HIDE_DAYS)]
        )
        : { rows: [] };

    const byStudent = new Map(fu.rows.map((r) => [r.student_id, r]));

    items = items.map((i) => {
        const f = byStudent.get(i.student_id);
        const handled = !!f && f.recent && f.signature === signatureOf(i);
        return {
            ...i,
            handled,
            followup: f ? { note: f.note, by: f.by_name, at: f.created_at } : null
        };
    });

    const open = items.filter((i) => !i.handled);

    const shown = query.show === "all" ? items : open;

    const limit = Number(query.limit);

    return {
        as_of: data.as_of,
        total_students: data.total_students,
        attendance_limit: data.attendance_limit,
        open_count: open.length,
        handled_count: items.length - open.length,
        class_teacher: scope === null ? null : scope.length > 0,
        items: Number.isInteger(limit) && limit > 0 ? shown.slice(0, limit) : shown
    };

}

/** Record a follow-up. School Admin: any student of the school. Teacher: own class only. */
async function addFollowup(user, studentId, noteInput) {

    const note = String(noteInput || "").trim();

    if (note.length < 3) throw fail("Please write a short note.");

    if (note.length > 500) throw fail("Please keep the note under 500 characters.");

    const st = await pool.query(
        "SELECT id, class_id, section_id FROM students WHERE id = $1 AND school_id = $2",
        [studentId, user.school_id]
    );

    const student = st.rows[0];

    if (!student) throw fail("Not found", 404);

    const scope = await scopeFor(user);

    if (scope !== null && !scope.some((c) => c.class_id === student.class_id && c.section_id === student.section_id)) {
        throw fail("Only the class teacher or the School Admin can add a follow-up.", 403);
    }

    const w = await insights.getEarlyWarnings(user.school_id, { studentId });

    const signature = w.items[0] ? signatureOf(w.items[0]) : "";

    const r = await pool.query(
        `INSERT INTO student_followups (school_id, student_id, user_id, note, signature)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [user.school_id, studentId, user.id, note, signature]
    );

    return { id: r.rows[0].id };

}

/** A student's follow-up history, newest first */
async function history(studentId) {

    const r = await pool.query(
        `SELECT f.id, f.note, f.created_at, u.full_name AS by_name
           FROM student_followups f LEFT JOIN users u ON u.id = f.user_id
          WHERE f.student_id = $1 ORDER BY f.created_at DESC LIMIT 10`,
        [studentId]
    );

    return r.rows;

}

module.exports = { list, addFollowup, history, signatureOf, scopeFor };
