const pool = require("../config/database");
const insights = require("./insights.service");
const attendanceService = require("./attendance.service");
const attention = require("./attention.service");

const r1 = (n) => Math.round(n * 10) / 10;

/**
 * Everything about one student on one page: details, attendance, marks, warnings, homework.
 * The caller must already have checked that the student belongs to the caller's school.
 */
async function getProfile(studentId) {

    const st = await pool.query(
        `SELECT s.id, s.school_id, s.admission_no, s.first_name, s.last_name, s.gender,
                s.date_of_birth::text AS date_of_birth, s.father_name, s.mother_name,
                s.parent_phone, s.parent_email, s.is_active, s.class_id, s.section_id,
                c.class_name, sec.section_name,
                (SELECT t.first_name || ' ' || COALESCE(t.last_name, '')
                   FROM teacher_subjects ts JOIN teachers t ON t.id = ts.teacher_id
                  WHERE ts.class_id = s.class_id AND ts.section_id = s.section_id
                    AND ts.is_class_teacher = true AND ts.ended_at IS NULL
                  LIMIT 1) AS class_teacher,
                (SELECT COUNT(*)::int FROM parent_students ps WHERE ps.student_id = s.id) AS app_accounts
           FROM students s
           JOIN classes c ON c.id = s.class_id
           JOIN sections sec ON sec.id = s.section_id
          WHERE s.id = $1`,
        [studentId]
    );

    const student = st.rows[0];

    if (!student) return null;

    const today = await insights.schoolToday(student.school_id);

    const mode = await attendanceService.getAttendanceMode(student.school_id);

    // ----- attendance: one status per day for the last 90 days -----
    const att = await pool.query(
        `SELECT attendance_date::text AS d,
                COUNT(*)::int AS n,
                COUNT(*) FILTER (WHERE status = 'Absent')::int AS ab,
                COUNT(*) FILTER (WHERE status = 'Late')::int AS lt
           FROM attendance
          WHERE student_id = $1
            AND attendance_date > ($2::date - 90)
            AND attendance_date <= $2::date
          GROUP BY attendance_date
          ORDER BY attendance_date`,
        [studentId, today]
    );

    // approved leave around this window (calendar + "on leave now")
    const lv = await pool.query(
        `SELECT from_date::text AS from_date, to_date::text AS to_date
           FROM leave_requests
          WHERE student_id = $1 AND status = 'Approved'
            AND to_date >= ($2::date - 90) AND from_date <= ($2::date + 60)
          ORDER BY from_date`,
        [studentId, today]
    );

    const leaves = lv.rows;

    const onLeave = (d) => leaves.some((l) => d >= l.from_date && d <= l.to_date);

    const days = att.rows.map((r) => {

        let state = "present";

        if (r.ab * 2 > r.n) state = "absent";
        else if (r.n === 2 && r.ab === 1) state = "half";
        else if (r.lt > 0) state = "late";

        return { date: r.d, state, absent_frac: r.ab / r.n, leave: state === "absent" && onLeave(r.d) };

    });

    const dayMs = 86400000;

    const ago = (d) => Math.round((new Date(`${today}T00:00:00Z`) - new Date(`${d}T00:00:00Z`)) / dayMs);

    const last30 = days.filter((d) => ago(d.date) < 30);

    const summarise = (list) => {

        const present = list.filter((d) => d.state === "present").length;
        const late = list.filter((d) => d.state === "late").length;
        const absent = list.filter((d) => d.state === "absent").length;
        const half = list.filter((d) => d.state === "half").length;

        // morning/afternoon school: a half day absent counts as half a day
        const attended = mode === "half_day"
            ? list.reduce((a, d) => a + (1 - d.absent_frac), 0)
            : list.filter((d) => d.state !== "absent").length;

        return {
            recorded: list.length, present, late, absent, half,
            percent: list.length ? r1((attended / list.length) * 100) : null
        };

    };

    // months, newest last (last 6 calendar months)
    const byMonth = new Map();

    days.forEach((d) => {
        const key = d.date.slice(0, 7);
        if (!byMonth.has(key)) byMonth.set(key, []);
        byMonth.get(key).push(d);
    });

    const months = [...byMonth.keys()].sort().slice(-6).map((k) => ({ month: k, ...summarise(byMonth.get(k)) }));

    // current absence streak (latest records, must be recent)
    let streak = 0;

    for (let i = days.length - 1; i >= 0; i--) {
        if (days[i].state === "absent") streak++; else break;
    }

    if (days.length === 0 || ago(days[days.length - 1].date) > 5) streak = 0;

    // ----- marks per exam -----
    const mk = await pool.query(
        `SELECT e.id AS exam_id, e.exam_name, e.start_date::text AS start_date,
                sub.subject_name, m.marks_obtained::float AS got, es.max_marks::float AS max,
                (m.marks_obtained < es.pass_marks) AS failed
           FROM student_marks m
           JOIN exam_subjects es ON es.id = m.exam_subject_id
           JOIN exams e ON e.id = es.exam_id
           JOIN teacher_subjects ts ON ts.id = es.teacher_subject_id
           JOIN subjects sub ON sub.id = ts.subject_id
          WHERE m.student_id = $1
          ORDER BY e.start_date DESC NULLS LAST, e.id DESC, sub.subject_name`,
        [studentId]
    );

    const exams = new Map();

    mk.rows.forEach((r) => {
        if (!exams.has(r.exam_id)) {
            exams.set(r.exam_id, { exam_id: r.exam_id, exam_name: r.exam_name, start_date: r.start_date, got: 0, max: 0, subjects: [] });
        }
        const e = exams.get(r.exam_id);
        e.got += r.got;
        e.max += r.max;
        e.subjects.push({ subject: r.subject_name, got: r.got, max: r.max, failed: r.failed });
    });

    const marks = [...exams.values()].slice(0, 6).map((e) => ({
        exam_id: e.exam_id,
        exam_name: e.exam_name,
        start_date: e.start_date,
        percent: e.max ? r1((e.got / e.max) * 100) : null,
        subjects: e.subjects
    })).reverse(); // oldest first, so a chart reads left to right

    // ----- homework acknowledgements in the last 30 days -----
    const hw = await pool.query(
        `SELECT COUNT(*)::int AS given,
                COUNT(*) FILTER (WHERE COALESCE(a.is_acknowledged, false))::int AS acknowledged
           FROM homework hw
           JOIN teacher_subjects ts ON ts.id = hw.teacher_subject_id
           LEFT JOIN acknowledgements a
                  ON a.post_type = 'homework' AND a.post_id = hw.id AND a.student_id = $1
          WHERE ts.class_id = $2 AND ts.section_id = $3
            AND COALESCE(hw.is_active, true) = true
            AND hw.require_acknowledgement = true
            AND hw.homework_date > ($4::date - 30)
            AND hw.homework_date <= $4::date`,
        [studentId, student.class_id, student.section_id, today]
    );

    // ----- early warning -----
    const ew = await insights.getEarlyWarnings(student.school_id, { studentId });

    const warning = ew.items && ew.items[0]
        ? { severity: ew.items[0].severity, flags: ew.items[0].flags || [], metrics: ew.items[0].metrics || {} }
        : null;

    return {
        as_of: today,
        attendance_mode: mode,
        student: {
            id: student.id,
            admission_no: student.admission_no,
            first_name: student.first_name,
            last_name: student.last_name,
            gender: student.gender,
            date_of_birth: student.date_of_birth,
            is_active: student.is_active,
            class_name: student.class_name,
            section_name: student.section_name,
            class_teacher: (student.class_teacher || "").trim() || null
        },
        parent: {
            father_name: student.father_name,
            mother_name: student.mother_name,
            phone: student.parent_phone,
            email: student.parent_email,
            app_accounts: student.app_accounts
        },
        attendance: {
            last30: summarise(last30),
            months,
            streak,
            leave_absences: last30.filter((d) => d.leave).length,
            on_leave_now: leaves.find((l) => today >= l.from_date && today <= l.to_date) || null,
            leaves,
            days: days.filter((d) => ago(d.date) < 90).map((d) => ({ date: d.date, state: d.state, leave: d.leave })),
            warn_limit: await insights.getAttendanceLimit(student.school_id)
        },
        marks,
        homework: hw.rows[0],
        warning,
        followups: await attention.history(studentId)
    };

}

module.exports = { getProfile };
