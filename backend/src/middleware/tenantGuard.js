// Multi-school safety check.
// Before a route runs, make sure every record the request points at
// (an id in the URL, or an id in the request body) belongs to the
// logged-in user's own school. Anything else answers "Not found",
// exactly as if the record did not exist, so another school's ids
// can neither be read nor changed - even if somebody guesses them.

const db = require("../config/database");
const { authenticate } = require("./auth.middleware");

// Each query returns the school that owns the record with id $1.
const OWNER = {
    student: "SELECT school_id FROM students WHERE id = $1",
    teacher: "SELECT school_id FROM teachers WHERE id = $1",
    class: "SELECT school_id FROM classes WHERE id = $1",
    section: "SELECT school_id FROM sections WHERE id = $1",
    subject: "SELECT school_id FROM subjects WHERE id = $1",
    grade: "SELECT school_id FROM grades WHERE id = $1",
    exam: "SELECT school_id FROM exams WHERE id = $1",
    announcement: "SELECT school_id FROM announcements WHERE id = $1",
    academic_year: "SELECT school_id FROM academic_years WHERE id = $1",
    calendar_day: "SELECT school_id FROM school_calendar_days WHERE id = $1",
    user: "SELECT school_id FROM users WHERE id = $1",
    teacher_subject: "SELECT school_id FROM teacher_subjects WHERE id = $1",
    homework:
        "SELECT ts.school_id FROM homework h JOIN teacher_subjects ts ON ts.id = h.teacher_subject_id WHERE h.id = $1",
    attendance:
        "SELECT s.school_id FROM attendance a JOIN students s ON s.id = a.student_id WHERE a.id = $1",
    exam_subject:
        "SELECT e.school_id FROM exam_subjects es JOIN exams e ON e.id = es.exam_id WHERE es.id = $1",
    student_mark:
        "SELECT e.school_id FROM student_marks m JOIN exam_subjects es ON es.id = m.exam_subject_id JOIN exams e ON e.id = es.exam_id WHERE m.id = $1",
    submission:
        "SELECT ts.school_id FROM homework_submissions hs JOIN homework h ON h.id = hs.homework_id JOIN teacher_subjects ts ON ts.id = h.teacher_subject_id WHERE hs.id = $1",
    greeting:
        "SELECT s.school_id FROM morning_greetings g JOIN students s ON s.id = g.student_id WHERE g.id = $1",
};

function notFound(res) {
    return res.status(404).json({ success: false, message: "Not found" });
}

function toId(v) {
    const n = Number(v);
    return Number.isInteger(n) && n > 0 && n < 2147483647 ? n : null;
}

// Runs the check; the Super Admin (no school) is never restricted here.
async function ownedBySchool(req, kind, rawId) {
    if (req.user.role === "Super Admin") return "ok";
    const id = toId(rawId);
    if (id === null) return "bad";
    const r = await db.query(OWNER[kind], [id]);
    if (!r.rows[0] || Number(r.rows[0].school_id) !== Number(req.user.school_id)) return "no";
    return "ok";
}

function wrap(check, meta) {
    const run = async (req, res, next) => {
        try {
            const verdict = await check(req);
            if (verdict === "ok") return next();
            if (verdict === "bad") {
                return res.status(400).json({ success: false, message: "Invalid id" });
            }
            return notFound(res);
        } catch (err) {
            return next(err);
        }
    };
    // Works anywhere in a route's chain, even before "authenticate".
    const guard = (req, res, next) => {
        if (req.user) return run(req, res, next);
        return authenticate(req, res, (err) => (err ? next(err) : run(req, res, next)));
    };
    guard.tenantMeta = meta;
    return guard;
}

/** An id in the URL, e.g. tenant.param("student", "studentId") */
function param(kind, name = "id") {
    if (!OWNER[kind]) throw new Error(`tenantGuard: unknown kind ${kind}`);
    return wrap((req) => ownedBySchool(req, kind, req.params[name]), { type: "param", kind, name });
}

/** An id in the request body; skipped when the field is not sent. */
function body(kind, field) {
    if (!OWNER[kind]) throw new Error(`tenantGuard: unknown kind ${kind}`);
    return wrap((req) => {
        const v = (req.body || {})[field];
        if (v === undefined || v === null || v === "") return "ok";
        return ownedBySchool(req, kind, v);
    }, { type: "body", kind, field });
}

/** A list in the body: body.records[].student_id (itemField) or body.greeting_ids[] (no itemField). */
function bodyList(kind, field, itemField) {
    if (!OWNER[kind]) throw new Error(`tenantGuard: unknown kind ${kind}`);
    return wrap(async (req) => {
        const list = (req.body || {})[field];
        if (list === undefined || list === null) return "ok";
        if (!Array.isArray(list)) return "bad";
        if (list.length > 2000) return "bad";
        const ids = new Set();
        for (const item of list) {
            const v = itemField ? (item || {})[itemField] : item;
            if (v === undefined || v === null || v === "") continue;
            ids.add(v);
        }
        for (const v of ids) {
            const verdict = await ownedBySchool(req, kind, v);
            if (verdict !== "ok") return verdict;
        }
        return "ok";
    }, { type: "list", kind, field, itemField });
}


// ---- Teachers: inside their own school they may only touch their own classes ----
// (a Teacher cannot open or change another teacher's attendance, marks or dashboard)
const TEACHER_OWNS = {
    teacher: "SELECT 1 FROM teachers WHERE id = $1 AND user_id = $2",
    teacher_subject:
        "SELECT 1 FROM teacher_subjects ts JOIN teachers t ON t.id = ts.teacher_id WHERE ts.id = $1 AND t.user_id = $2",
    attendance:
        "SELECT 1 FROM attendance a JOIN teacher_subjects ts ON ts.id = a.teacher_subject_id JOIN teachers t ON t.id = ts.teacher_id WHERE a.id = $1 AND t.user_id = $2",
    exam_subject:
        "SELECT 1 FROM exam_subjects es JOIN teacher_subjects ts ON ts.id = es.teacher_subject_id JOIN teachers t ON t.id = ts.teacher_id WHERE es.id = $1 AND t.user_id = $2",
    student_mark:
        "SELECT 1 FROM student_marks m JOIN exam_subjects es ON es.id = m.exam_subject_id JOIN teacher_subjects ts ON ts.id = es.teacher_subject_id JOIN teachers t ON t.id = ts.teacher_id WHERE m.id = $1 AND t.user_id = $2",
    homework:
        "SELECT 1 FROM homework h JOIN teacher_subjects ts ON ts.id = h.teacher_subject_id JOIN teachers t ON t.id = ts.teacher_id WHERE h.id = $1 AND t.user_id = $2",
    // a student in a class/section the teacher teaches
    student:
        "SELECT 1 FROM students s JOIN teacher_subjects ts ON ts.class_id = s.class_id AND ts.section_id = s.section_id AND ts.ended_at IS NULL JOIN teachers t ON t.id = ts.teacher_id WHERE s.id = $1 AND t.user_id = $2 LIMIT 1",
};

async function teacherOwns(req, kind, rawId) {
    if (req.user.role !== "Teacher") return "ok";
    const id = toId(rawId);
    if (id === null) return "bad";
    const r = await db.query(TEACHER_OWNS[kind], [id, req.user.id]);
    return r.rows.length ? "ok" : "no";
}

/** Teacher only: the id in the URL must be theirs (School Admin / Parent are unaffected here). */
function teacherParam(kind, name = "id") {
    if (!TEACHER_OWNS[kind]) throw new Error(`tenantGuard: unknown teacher kind ${kind}`);
    return wrap((req) => teacherOwns(req, kind, req.params[name]), { type: "teacherParam", kind, name });
}

/** A school id in the URL must be the user's own school. */
function ownSchool(name = "schoolId") {
    return wrap((req) => {
        if (req.user.role === "Super Admin") return "ok";
        return Number(req.params[name]) === Number(req.user.school_id) ? "ok" : "no";
    }, { type: "ownSchool", name });
}

module.exports = { param, body, bodyList, ownSchool, teacherParam, OWNER, TEACHER_OWNS };
