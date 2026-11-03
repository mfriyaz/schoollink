const ExcelJS = require("exceljs");

const pool = require("../config/database");
const insights = require("./insights.service");

const r1 = (n) => Math.round(n * 10) / 10;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const MAX_DAYS = 400;

/**
 * Attendance report for a School Admin: one row per active student, for a date range.
 * A student's day is Absent when most of that day's records are Absent, Half when only one
 * of two sessions is absent, Late when not absent but late, otherwise Present.
 * Percent = days attended (present + late + half) out of days recorded.
 */
async function getReport(schoolId, query) {

    const today = await insights.schoolToday(schoolId);

    let to = DATE_RE.test(query.to || "") ? query.to : today;

    let from = DATE_RE.test(query.from || "") ? query.from : null;

    if (!from) {
        const d = new Date(`${to}T00:00:00Z`);
        d.setUTCDate(d.getUTCDate() - 29);
        from = d.toISOString().slice(0, 10);
    }

    if (from > to) [from, to] = [to, from];

    const span = (new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000;

    if (span > MAX_DAYS) {
        const err = new Error("Please choose a range of 13 months or less.");
        err.status = 400;
        throw err;
    }

    const classId = Number.isInteger(Number(query.class_id)) && Number(query.class_id) > 0 ? Number(query.class_id) : null;

    const sectionId = Number.isInteger(Number(query.section_id)) && Number(query.section_id) > 0 ? Number(query.section_id) : null;

    const result = await pool.query(
        `
        WITH day AS (
            SELECT a.student_id, a.attendance_date,
                   COUNT(*)::int AS n,
                   COUNT(*) FILTER (WHERE a.status = 'Absent')::int AS ab,
                   COUNT(*) FILTER (WHERE a.status = 'Late')::int AS lt
              FROM attendance a
              JOIN students s ON s.id = a.student_id
             WHERE s.school_id = $1
               AND a.attendance_date BETWEEN $2::date AND $3::date
             GROUP BY a.student_id, a.attendance_date
        ), st AS (
            SELECT student_id,
                   CASE
                       WHEN ab * 2 > n THEN 'absent'
                       WHEN n = 2 AND ab = 1 THEN 'half'
                       WHEN lt > 0 THEN 'late'
                       ELSE 'present'
                   END AS state
              FROM day
        )
        SELECT s.id AS student_id, s.class_id, s.section_id, s.admission_no, s.first_name, s.last_name,
               c.class_name, sec.section_name, s.parent_phone,
               COUNT(st.state)::int AS recorded,
               COUNT(*) FILTER (WHERE st.state = 'present')::int AS present,
               COUNT(*) FILTER (WHERE st.state = 'late')::int AS late,
               COUNT(*) FILTER (WHERE st.state = 'half')::int AS half,
               COUNT(*) FILTER (WHERE st.state = 'absent')::int AS absent
          FROM students s
          JOIN classes c ON c.id = s.class_id
          JOIN sections sec ON sec.id = s.section_id
          LEFT JOIN st ON st.student_id = s.id
         WHERE s.school_id = $1 AND s.is_active = true
           AND ($4::int IS NULL OR s.class_id = $4)
           AND ($5::int IS NULL OR s.section_id = $5)
         GROUP BY s.id, c.class_order, c.class_name, sec.section_name
         ORDER BY c.class_order, sec.section_name, s.first_name, s.last_name
        `,
        [schoolId, from, to, classId, sectionId]
    );

    const rows = result.rows.map((r) => ({
        ...r,
        percent: r.recorded ? r1(((r.recorded - r.absent) / r.recorded) * 100) : null
    }));

    const recorded = rows.reduce((a, r) => a + r.recorded, 0);
    const absent = rows.reduce((a, r) => a + r.absent, 0);

    return {
        from,
        to,
        summary: {
            students: rows.length,
            percent: recorded ? r1(((recorded - absent) / recorded) * 100) : null,
            absent_days: absent,
            late_days: rows.reduce((a, r) => a + r.late, 0)
        },
        rows
    };

}

/** Stop a spreadsheet from running a name or number as a formula */
function safeCell(v) {
    if (typeof v === "string" && /^[=+\-@\t\r]/.test(v)) return `'${v}`;
    return v;
}

async function buildWorkbook(report) {

    const wb = new ExcelJS.Workbook();

    const ws = wb.addWorksheet("Attendance");

    ws.addRow([`Attendance report ${report.from} to ${report.to}`]).font = { bold: true, size: 13 };

    ws.addRow([]);

    const head = ws.addRow(["Admission no", "Student", "Class", "Section", "Days recorded", "Present", "Late", "Half day", "Absent", "Attendance %", "Parent phone"]);

    head.font = { bold: true };

    head.eachCell((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE6EEF9" } }; });

    for (const r of report.rows) {
        ws.addRow([
            safeCell(r.admission_no),
            safeCell(`${r.first_name} ${r.last_name || ""}`.trim()),
            safeCell(r.class_name),
            safeCell(r.section_name),
            r.recorded, r.present, r.late, r.half, r.absent,
            r.percent,
            safeCell(r.parent_phone || "")
        ]);
    }

    [14, 26, 12, 10, 14, 10, 8, 10, 8, 14, 18].forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    ws.views = [{ state: "frozen", ySplit: 3 }];

    return wb.xlsx.writeBuffer();

}

module.exports = { getReport, buildWorkbook };
