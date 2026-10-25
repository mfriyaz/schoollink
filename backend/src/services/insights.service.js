const pool = require("../config/database");

/**
 * Facts for the parent weekly summary and rule-based early warnings.
 * Everything here is plain database work: no AI is involved, so the numbers
 * are always exact.
 */

const WEEK_DAYS = 7;
const WARN_DAYS = 30;
const MIN_ATTENDANCE_RECORDS = 5;
const DEFAULT_LOW_ATTENDANCE = 85;
const VERY_LOW_GAP = 10;
const STREAK_FLAG = 3;
const STREAK_HIGH = 5;
const MARKS_DROP = 10;

async function schoolToday(schoolId) {
    const r = await pool.query(
        `SELECT (NOW() AT TIME ZONE COALESCE(NULLIF(timezone,''), 'UTC'))::date::text AS today
           FROM schools WHERE id = $1`,
        [schoolId]
    );
    return r.rows[0] ? r.rows[0].today : new Date().toISOString().slice(0, 10);
}

// The attendance warning level is a school setting (default 85)
async function getAttendanceLimit(schoolId) {
    try {
        const r = await pool.query("SELECT warn_attendance_pct FROM schools WHERE id = $1", [schoolId]);
        const n = Number(r.rows[0] && r.rows[0].warn_attendance_pct);
        return Number.isInteger(n) && n >= 50 && n <= 100 ? n : DEFAULT_LOW_ATTENDANCE;
    } catch (e) {
        return DEFAULT_LOW_ATTENDANCE; // column not added yet
    }
}

async function getAttendanceMode(schoolId) {
    try {
        const r = await pool.query("SELECT attendance_mode FROM schools WHERE id = $1", [schoolId]);
        return (r.rows[0] && r.rows[0].attendance_mode) || "subject";
    } catch (e) {
        return "subject";
    }
}

async function setAttendanceLimit(schoolId, value) {
    const n = Number(value);
    if (!Number.isInteger(n) || n < 50 || n > 100) {
        const err = new Error("The warning level must be a whole number from 50 to 100.");
        err.status = 400;
        throw err;
    }
    const before = await getAttendanceLimit(schoolId);
    await pool.query("UPDATE schools SET warn_attendance_pct = $1 WHERE id = $2", [n, schoolId]);
    return { before, after: n };
}

const r1 = (n) => Math.round(n * 10) / 10;

// ---------------------------------------------------------------------------
// Parent weekly summary facts
// ---------------------------------------------------------------------------
async function getWeeklyFacts(studentId) {

    const st = await pool.query(
        `SELECT s.id, s.school_id, s.first_name, s.last_name, s.class_id, s.section_id,
                c.class_name, sec.section_name
           FROM students s
           JOIN classes c ON c.id = s.class_id
           JOIN sections sec ON sec.id = s.section_id
          WHERE s.id = $1`,
        [studentId]
    );
    const student = st.rows[0];
    if (!student) return null;

    const today = await schoolToday(student.school_id);

    // Attendance: one status per day (absent when most of the day's records are Absent)
    const att = await pool.query(
        `SELECT attendance_date::text AS d,
                COUNT(*)::int AS n,
                COUNT(*) FILTER (WHERE status = 'Absent')::int AS absent,
                COUNT(*) FILTER (WHERE status = 'Late')::int AS late
           FROM attendance
          WHERE student_id = $1
            AND attendance_date > ($2::date - $3::int)
            AND attendance_date <= $2::date
          GROUP BY attendance_date
          ORDER BY attendance_date`,
        [studentId, today, WEEK_DAYS]
    );

    let present = 0, absent = 0, late = 0;
    const absentDates = [];
    att.rows.forEach((d) => {
        if (d.absent * 2 > d.n) { absent++; absentDates.push(d.d); }
        else if (d.late * 2 > d.n) { late++; }
        else present++;
    });
    const recorded = att.rows.length;

    // Homework given this week
    const hw = await pool.query(
        `SELECT hw.id, hw.title, hw.due_date::text AS due_date, hw.require_acknowledgement,
                s.subject_name,
                COALESCE(a.is_acknowledged, false) AS acked
           FROM homework hw
           JOIN teacher_subjects ts ON ts.id = hw.teacher_subject_id
           JOIN subjects s ON s.id = ts.subject_id
           LEFT JOIN acknowledgements a
                  ON a.post_type = 'homework' AND a.post_id = hw.id AND a.student_id = $1
          WHERE ts.class_id = $2 AND ts.section_id = $3
            AND COALESCE(hw.is_active, true) = true
            AND hw.homework_date > ($4::date - $5::int)
            AND hw.homework_date <= $4::date
          ORDER BY hw.homework_date DESC, hw.id DESC`,
        [studentId, student.class_id, student.section_id, today, WEEK_DAYS]
    );

    // Homework still open (due today or later) that needs a tick from the parent
    const pending = await pool.query(
        `SELECT hw.title, s.subject_name, hw.due_date::text AS due_date
           FROM homework hw
           JOIN teacher_subjects ts ON ts.id = hw.teacher_subject_id
           JOIN subjects s ON s.id = ts.subject_id
           LEFT JOIN acknowledgements a
                  ON a.post_type = 'homework' AND a.post_id = hw.id AND a.student_id = $1
          WHERE ts.class_id = $2 AND ts.section_id = $3
            AND COALESCE(hw.is_active, true) = true
            AND hw.require_acknowledgement = true
            AND COALESCE(a.is_acknowledged, false) = false
            AND hw.due_date >= $4::date
            AND hw.homework_date <= $4::date
          ORDER BY hw.due_date, hw.id
          LIMIT 5`,
        [studentId, student.class_id, student.section_id, today]
    );

    // Announcements published this week (same visibility rule as the parent app)
    const an = await pool.query(
        `SELECT an.id, an.title, an.publish_date::text AS publish_date
           FROM announcements an
          WHERE an.school_id = $1
            AND an.is_active = true
            AND (an.expiry_date IS NULL OR an.expiry_date >= $3::date)
            AND an.publish_date > ($3::date - $4::int)
            AND an.publish_date <= $3::date
            AND (
                an.target_audience IN ('All','Students','Parents')
                OR EXISTS (SELECT 1 FROM announcement_classes ac
                            WHERE ac.announcement_id = an.id AND ac.class_id = $2)
            )
          ORDER BY an.publish_date DESC, an.id DESC
          LIMIT 10`,
        [student.school_id, student.class_id, today, WEEK_DAYS]
    );

    // Marks entered this week, grouped by exam
    const mk = await pool.query(
        `SELECT e.id AS exam_id, e.exam_name,
                SUM(m.marks_obtained)::float AS got,
                SUM(es.max_marks)::float AS max,
                COUNT(*)::int AS subjects,
                COUNT(*) FILTER (WHERE m.marks_obtained < es.pass_marks)::int AS failed
           FROM student_marks m
           JOIN exam_subjects es ON es.id = m.exam_subject_id
           JOIN exams e ON e.id = es.exam_id
          WHERE m.student_id = $1
            AND m.created_at >= ($2::date - $3::int)::timestamp
          GROUP BY e.id, e.exam_name
          ORDER BY e.id DESC
          LIMIT 3`,
        [studentId, today, WEEK_DAYS]
    );

    const marks = mk.rows.map((m) => ({
        exam_name: m.exam_name,
        subjects: m.subjects,
        percentage: m.max ? r1((m.got / m.max) * 100) : 0,
        failed: m.failed,
    }));

    return {
        student_id: student.id,
        school_id: student.school_id,
        first_name: student.first_name,
        class_name: student.class_name,
        section_name: student.section_name,
        as_of: today,
        attendance: { recorded, present, late, absent, absent_dates: absentDates },
        homework: {
            given: hw.rows.length,
            items: hw.rows.slice(0, 6).map((h) => ({ title: h.title, subject: h.subject_name, due_date: h.due_date })),
            pending_ack: pending.rows.map((h) => ({ title: h.title, subject: h.subject_name, due_date: h.due_date })),
        },
        announcements: { count: an.rows.length, titles: an.rows.slice(0, 5).map((a) => a.title) },
        marks,
    };
}

// Plain text of the facts, used for the AI prompt and for change detection
function factsToText(f) {
    const a = f.attendance;
    const lines = [
        `Student first name: ${f.first_name}`,
        `Class: ${f.class_name} ${f.section_name}`,
        `Period: the last ${WEEK_DAYS} days up to ${f.as_of}`,
        a.recorded
            ? `Attendance: ${a.recorded} school days recorded: ${a.present} present, ${a.late} late, ${a.absent} absent${a.absent_dates.length ? " (absent on " + a.absent_dates.join(", ") + ")" : ""}`
            : "Attendance: no attendance recorded this week",
        `Homework given this week: ${f.homework.given}`,
        ...f.homework.items.map((h) => `- ${h.subject}: ${h.title} (due ${h.due_date})`),
        f.homework.pending_ack.length
            ? "Homework waiting for the parent to acknowledge: " + f.homework.pending_ack.map((h) => `${h.subject} - ${h.title} (due ${h.due_date})`).join("; ")
            : "Homework waiting for the parent to acknowledge: none",
        `New announcements this week: ${f.announcements.count}`,
        ...f.announcements.titles.map((t) => `- ${t}`),
    ];
    if (f.marks.length) {
        f.marks.forEach((m) => lines.push(
            `Marks published: ${m.exam_name}, ${m.percentage}% overall across ${m.subjects} subjects${m.failed ? `, ${m.failed} below pass marks` : ""}`
        ));
    } else {
        lines.push("Marks published this week: none");
    }
    return lines.join("\n");
}

function hasAnything(f) {
    return f.attendance.recorded > 0 || f.homework.given > 0 || f.homework.pending_ack.length > 0 ||
        f.announcements.count > 0 || f.marks.length > 0;
}

// ---------------------------------------------------------------------------
// Early warning (rules)
// ---------------------------------------------------------------------------
async function getEarlyWarnings(schoolId, { classId, studentId } = {}) {

    const today = await schoolToday(schoolId);
    const LOW_ATTENDANCE = await getAttendanceLimit(schoolId);
    const halfDay = (await getAttendanceMode(schoolId)) === "half_day";
    const VERY_LOW_ATTENDANCE = Math.max(0, LOW_ATTENDANCE - VERY_LOW_GAP);

    const sv = [schoolId];
    let sw = "s.school_id = $1 AND COALESCE(s.is_active, true) = true";
    if (classId) { sv.push(Number(classId)); sw += ` AND s.class_id = $${sv.length}`; }
    if (studentId) { sv.push(Number(studentId)); sw += ` AND s.id = $${sv.length}`; }

    const studs = await pool.query(
        `SELECT s.id, s.first_name, s.last_name, s.admission_no, s.class_id, s.section_id,
                c.class_name, sec.section_name
           FROM students s
           JOIN classes c ON c.id = s.class_id
           JOIN sections sec ON sec.id = s.section_id
          WHERE ${sw}`,
        sv
    );
    if (!studs.rows.length) return { as_of: today, total_students: 0, attendance_limit: LOW_ATTENDANCE, items: [] };

    const ids = studs.rows.map((s) => s.id);

    // Attendance, one status per student per day
    const att = await pool.query(
        `SELECT student_id, attendance_date::text AS d,
                (COUNT(*) FILTER (WHERE status = 'Absent') * 2 > COUNT(*)) AS absent,
                (COUNT(*) FILTER (WHERE status = 'Absent'))::float / COUNT(*) AS absent_frac
           FROM attendance
          WHERE student_id = ANY($1::int[])
            AND attendance_date > ($2::date - $3::int)
            AND attendance_date <= $2::date
          GROUP BY student_id, attendance_date
          ORDER BY student_id, attendance_date`,
        [ids, today, WARN_DAYS]
    );
    const attBy = new Map();
    att.rows.forEach((r) => {
        if (!attBy.has(r.student_id)) attBy.set(r.student_id, []);
        attBy.get(r.student_id).push(r);
    });

    // Marks per exam
    const mk = await pool.query(
        `SELECT m.student_id, e.id AS exam_id, e.exam_name, e.start_date::text AS start_date,
                SUM(m.marks_obtained)::float AS got, SUM(es.max_marks)::float AS max,
                ARRAY_AGG(sub.subject_name) FILTER (WHERE m.marks_obtained < es.pass_marks) AS failed_subjects
           FROM student_marks m
           JOIN exam_subjects es ON es.id = m.exam_subject_id
           JOIN exams e ON e.id = es.exam_id
           JOIN teacher_subjects ts ON ts.id = es.teacher_subject_id
           JOIN subjects sub ON sub.id = ts.subject_id
          WHERE m.student_id = ANY($1::int[])
          GROUP BY m.student_id, e.id, e.exam_name, e.start_date
          ORDER BY m.student_id, e.start_date DESC, e.id DESC`,
        [ids]
    );
    const mkBy = new Map();
    mk.rows.forEach((r) => {
        if (!mkBy.has(r.student_id)) mkBy.set(r.student_id, []);
        mkBy.get(r.student_id).push(r);
    });

    const items = [];

    studs.rows.forEach((s) => {

        const flags = [];
        const metrics = {};
        let score = 0;
        let high = false;

        // ----- attendance -----
        const days = attBy.get(s.id) || [];
        if (days.length >= MIN_ATTENDANCE_RECORDS) {
            // Morning and afternoon mode: a half day absent counts as half a day
            const presentDays = halfDay
                ? days.reduce((a, d) => a + (1 - Number(d.absent_frac || 0)), 0)
                : days.filter((d) => !d.absent).length;
            const rate = r1((presentDays / days.length) * 100);
            metrics.attendance_rate = rate;
            metrics.attendance_days = days.length;
            if (rate < LOW_ATTENDANCE) {
                flags.push({ type: "attendance", text: `Attendance is ${rate}% over the last ${days.length} recorded days` });
                score++;
                if (rate < VERY_LOW_ATTENDANCE) high = true;
            }
        }

        // current absence streak (latest record must be recent)
        if (days.length) {
            let streak = 0;
            for (let i = days.length - 1; i >= 0 && days[i].absent; i--) streak++;
            const lastDate = new Date(days[days.length - 1].d + "T00:00:00Z");
            const ageDays = Math.round((new Date(today + "T00:00:00Z") - lastDate) / 86400000);
            if (streak >= STREAK_FLAG && ageDays <= 7) {
                metrics.absent_streak = streak;
                flags.push({ type: "streak", text: `Absent for ${streak} school days in a row` });
                score++;
                if (streak >= STREAK_HIGH) high = true;
            }
        }

        // ----- marks -----
        const exams = mkBy.get(s.id) || [];
        if (exams.length) {
            const latest = exams[0];
            const pct = latest.max ? r1((latest.got / latest.max) * 100) : 0;
            metrics.latest_exam = latest.exam_name;
            metrics.latest_percentage = pct;
            const failed = latest.failed_subjects || [];
            if (failed.length) {
                metrics.failed_subjects = failed;
                flags.push({ type: "failed", text: `Below pass marks in ${failed.join(", ")} (${latest.exam_name})` });
                score++;
            }
            if (exams.length > 1) {
                const prev = exams[1];
                const prevPct = prev.max ? r1((prev.got / prev.max) * 100) : 0;
                metrics.previous_exam = prev.exam_name;
                metrics.previous_percentage = prevPct;
                if (prevPct - pct >= MARKS_DROP) {
                    flags.push({ type: "drop", text: `Marks fell from ${prevPct}% (${prev.exam_name}) to ${pct}% (${latest.exam_name})` });
                    score++;
                }
            }
            if (pct < 40) high = true;
        }

        if (!flags.length) return;

        const severity = (high || score >= 2) ? "high" : "medium";

        items.push({
            student_id: s.id,
            name: `${s.first_name} ${s.last_name || ""}`.trim(),
            first_name: s.first_name,
            admission_no: s.admission_no,
            class_id: s.class_id,
            class_name: s.class_name,
            section_name: s.section_name,
            severity,
            flags,
            metrics,
            _score: score,
        });
    });

    items.sort((a, b) =>
        (a.severity === b.severity ? 0 : a.severity === "high" ? -1 : 1) ||
        b._score - a._score ||
        a.name.localeCompare(b.name)
    );
    items.forEach((i) => delete i._score);

    return { as_of: today, total_students: studs.rows.length, attendance_limit: LOW_ATTENDANCE, items };
}

module.exports = { getAttendanceLimit, setAttendanceLimit, getWeeklyFacts, factsToText, hasAnything, getEarlyWarnings, schoolToday };
