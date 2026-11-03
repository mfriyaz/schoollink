const pool = require("../config/database");
const insights = require("./insights.service");
const notifier = require("./notifier.service");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const MAX_DAYS = 30;

function fail(message, status = 400) {
    const err = new Error(message);
    err.status = status;
    return err;
}

function dayCount(from, to) {
    return Math.round((new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000) + 1;
}

const SELECT = `
    SELECT lr.id, lr.student_id, lr.from_date::text AS from_date, lr.to_date::text AS to_date,
           lr.reason, lr.status, lr.decision_note, lr.decided_at, lr.created_at,
           s.first_name, s.last_name, s.admission_no, c.class_name, sec.section_name,
           u.full_name AS parent_name, du.full_name AS decided_by_name
      FROM leave_requests lr
      JOIN students s ON s.id = lr.student_id
      JOIN classes c ON c.id = s.class_id
      JOIN sections sec ON sec.id = s.section_id
      JOIN users u ON u.id = lr.parent_user_id
      LEFT JOIN users du ON du.id = lr.decided_by
`;

/** Parent asks for leave for one of their own children */
async function createRequest(user, body) {

    const studentId = Number(body.student_id);

    const from = String(body.from_date || "");

    const to = String(body.to_date || body.from_date || "");

    const reason = String(body.reason || "").trim();

    if (!Number.isInteger(studentId) || studentId <= 0) throw fail("Choose a child.");

    if (!DATE_RE.test(from) || !DATE_RE.test(to)) throw fail("Choose the leave dates.");

    if (to < from) throw fail("The last day cannot be before the first day.");

    if (dayCount(from, to) > MAX_DAYS) throw fail(`Leave can be asked for up to ${MAX_DAYS} days at a time.`);

    if (reason.length < 3) throw fail("Please write a short reason.");

    if (reason.length > 500) throw fail("Please keep the reason under 500 characters.");

    // the child must be linked to this parent and belong to the parent's school
    const own = await pool.query(
        `SELECT s.id, s.first_name, s.class_id, s.section_id
           FROM parent_students ps
           JOIN students s ON s.id = ps.student_id
          WHERE ps.parent_user_id = $1 AND ps.student_id = $2
            AND s.school_id = $3 AND s.is_active = true`,
        [user.id, studentId, user.school_id]
    );

    const student = own.rows[0];

    if (!student) throw fail("Child not found.", 404);

    const today = await insights.schoolToday(user.school_id);

    const earliest = new Date(`${today}T00:00:00Z`);
    earliest.setUTCDate(earliest.getUTCDate() - 7);

    if (from < earliest.toISOString().slice(0, 10)) throw fail("Leave cannot start more than a week ago.");

    const clash = await pool.query(
        `SELECT 1 FROM leave_requests
          WHERE student_id = $1 AND status IN ('Pending', 'Approved')
            AND from_date <= $3::date AND to_date >= $2::date
          LIMIT 1`,
        [studentId, from, to]
    );

    if (clash.rows.length > 0) throw fail("There is already a leave request for these dates.");

    const ins = await pool.query(
        `INSERT INTO leave_requests (school_id, student_id, parent_user_id, from_date, to_date, reason)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
        [user.school_id, studentId, user.id, from, to, reason]
    );

    // tell the class teacher(s); if the class has none, tell the school admins
    const people = await pool.query(
        `SELECT DISTINCT t.user_id AS id
           FROM teacher_subjects ts JOIN teachers t ON t.id = ts.teacher_id
          WHERE ts.class_id = $1 AND ts.section_id = $2 AND ts.is_class_teacher = true
            AND ts.ended_at IS NULL AND t.user_id IS NOT NULL AND t.is_active = true`,
        [student.class_id, student.section_id]
    );

    let recipients = people.rows.map((r) => r.id);

    if (recipients.length === 0) {
        const admins = await pool.query(
            `SELECT u.id FROM users u JOIN roles r ON r.id = u.role_id
              WHERE u.school_id = $1 AND r.role_name = 'School Admin' AND u.is_active = true`,
            [user.school_id]
        );
        recipients = admins.rows.map((r) => r.id);
    }

    const when = from === to ? from : `${from} to ${to}`;

    const message = `${student.first_name}: leave requested for ${when}.`;

    for (const id of recipients) {
        try {
            await notifier.notifyIfEnabled(id, "Leave request", message, message, "/leave-requests", { email: false });
        } catch (err) {
            console.error("Leave notify failed:", err.message);
        }
    }

    return { id: ins.rows[0].id };

}

/** A parent's own requests, newest first */
async function listMine(user) {

    const r = await pool.query(
        `${SELECT}
          WHERE lr.parent_user_id = $1 AND lr.school_id = $2
          ORDER BY lr.created_at DESC
          LIMIT 100`,
        [user.id, user.school_id]
    );

    return r.rows;

}

/** Parent withdraws a request that nobody has answered yet */
async function cancelMine(user, id) {

    const r = await pool.query(
        `DELETE FROM leave_requests
          WHERE id = $1 AND parent_user_id = $2 AND school_id = $3 AND status = 'Pending'
          RETURNING id`,
        [id, user.id, user.school_id]
    );

    if (r.rows.length === 0) throw fail("This request can no longer be withdrawn.", 404);

}

/**
 * Staff list. School Admin sees the whole school; a teacher sees the classes they are
 * class teacher of. status: "Pending" (default) | "all"
 */
async function listForStaff(user, status) {

    const params = [user.school_id];

    let scope = "";

    if (user.role === "Teacher") {
        params.push(user.id);
        scope = `AND EXISTS (
            SELECT 1 FROM teacher_subjects ts JOIN teachers t ON t.id = ts.teacher_id
             WHERE t.user_id = $2 AND ts.class_id = s.class_id AND ts.section_id = s.section_id
               AND ts.is_class_teacher = true AND ts.ended_at IS NULL)`;
    }

    const filter = status === "all" ? "" : "AND lr.status = 'Pending'";

    const r = await pool.query(
        `${SELECT}
          WHERE lr.school_id = $1 ${filter} ${scope}
          ORDER BY (lr.status = 'Pending') DESC, lr.from_date DESC, lr.id DESC
          LIMIT 200`,
        params
    );

    return r.rows;

}

/** Approve or decline. A teacher may only answer for their own class. */
async function decide(user, id, decision, note) {

    if (!["Approved", "Declined"].includes(decision)) throw fail("Choose Approved or Declined.");

    const cleanNote = String(note || "").trim().slice(0, 300) || null;

    const rows = await listForStaffOne(user, id);

    const lr = rows[0];

    if (!lr) throw fail("Not found", 404);

    if (lr.status !== "Pending") throw fail("This request has already been answered.", 409);

    await pool.query(
        `UPDATE leave_requests
            SET status = $1, decided_by = $2, decided_at = CURRENT_TIMESTAMP, decision_note = $3
          WHERE id = $4 AND status = 'Pending'`,
        [decision, user.id, cleanNote, id]
    );

    const when = lr.from_date === lr.to_date ? lr.from_date : `${lr.from_date} to ${lr.to_date}`;

    const message = `${lr.first_name}'s leave for ${when} was ${decision.toLowerCase()}.${cleanNote ? ` Note: ${cleanNote}` : ""}`;

    try {
        await notifier.notifyIfEnabled(lr.parent_user_id, `Leave ${decision.toLowerCase()}`, message, message, "/parent/leave", { email: false });
    } catch (err) {
        console.error("Leave notify failed:", err.message);
    }

}

async function listForStaffOne(user, id) {

    const params = [user.school_id, id];

    let scope = "";

    if (user.role === "Teacher") {
        params.push(user.id);
        scope = `AND EXISTS (
            SELECT 1 FROM teacher_subjects ts JOIN teachers t ON t.id = ts.teacher_id
             WHERE t.user_id = $3 AND ts.class_id = s.class_id AND ts.section_id = s.section_id
               AND ts.is_class_teacher = true AND ts.ended_at IS NULL)`;
    }

    const r = await pool.query(
        `SELECT lr.id, lr.status, lr.parent_user_id, lr.from_date::text AS from_date, lr.to_date::text AS to_date, s.first_name
           FROM leave_requests lr JOIN students s ON s.id = lr.student_id
          WHERE lr.school_id = $1 AND lr.id = $2 ${scope}`,
        params
    );

    return r.rows;

}

module.exports = { createRequest, listMine, cancelMine, listForStaff, decide };
