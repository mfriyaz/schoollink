const pool = require("../config/database");
const insights = require("./insights.service");

/**
 * School Admin: today's attendance for every class in the school.
 * One status per student per day:
 *   Absent  - most of the day's records are Absent
 *   Half    - half-day school, absent in only one of the two sessions
 *   Late    - not absent, at least one Late record
 *   Present - otherwise
 * A class is "done" when every student on the roll has a record, "partial" when only some do,
 * and "not_submitted" when no student has one.
 */
async function getBoard(schoolId, dateInput) {

    const date = /^\d{4}-\d{2}-\d{2}$/.test(dateInput || "") ? dateInput : await insights.schoolToday(schoolId);

    const classes = await pool.query(
        `
        WITH day AS (
            SELECT a.student_id,
                   COUNT(*)::int AS n,
                   COUNT(*) FILTER (WHERE a.status = 'Absent')::int AS ab,
                   COUNT(*) FILTER (WHERE a.status = 'Late')::int AS lt
              FROM attendance a
              JOIN students s ON s.id = a.student_id
             WHERE s.school_id = $1 AND a.attendance_date = $2::date
             GROUP BY a.student_id
        ), st AS (
            SELECT s.id, s.class_id, s.section_id,
                   d.n, d.ab, d.lt,
                   CASE
                       WHEN d.n IS NULL THEN 'none'
                       WHEN d.ab * 2 > d.n THEN 'absent'
                       WHEN d.n = 2 AND d.ab = 1 THEN 'half'
                       WHEN d.lt > 0 THEN 'late'
                       ELSE 'present'
                   END AS state
              FROM students s
              LEFT JOIN day d ON d.student_id = s.id
             WHERE s.school_id = $1 AND s.is_active = true
        )
        SELECT c.id AS class_id, sec.id AS section_id, c.class_name, sec.section_name,
               (SELECT t.first_name || ' ' || COALESCE(t.last_name, '')
                  FROM teacher_subjects ts JOIN teachers t ON t.id = ts.teacher_id
                 WHERE ts.class_id = c.id AND ts.section_id = sec.id
                   AND ts.is_class_teacher = true AND ts.ended_at IS NULL
                 LIMIT 1) AS class_teacher,
               COUNT(st.id)::int AS on_roll,
               COUNT(*) FILTER (WHERE st.state <> 'none')::int AS marked,
               COUNT(*) FILTER (WHERE st.state IN ('present', 'half'))::int AS present,
               COUNT(*) FILTER (WHERE st.state = 'late')::int AS late,
               COUNT(*) FILTER (WHERE st.state = 'absent')::int AS absent,
               COUNT(*) FILTER (WHERE st.state = 'half')::int AS half
          FROM sections sec
          JOIN classes c ON c.id = sec.class_id
          LEFT JOIN st ON st.class_id = c.id AND st.section_id = sec.id
         WHERE sec.school_id = $1 AND sec.is_active = true AND c.is_active = true
         GROUP BY c.id, c.class_order, c.class_name, sec.id, sec.section_name
        HAVING COUNT(st.id) > 0
         ORDER BY c.class_order, sec.section_name
        `,
        [schoolId, date]
    );

    const rows = classes.rows.map((r) => {

        const status = r.marked === 0 ? "not_submitted" : (r.marked < r.on_roll ? "partial" : "done");

        const attended = r.present + r.late;

        return {
            class_id: r.class_id,
            section_id: r.section_id,
            class_name: r.class_name,
            section_name: r.section_name,
            class_teacher: (r.class_teacher || "").trim() || null,
            on_roll: r.on_roll,
            marked: r.marked,
            present: r.present,
            late: r.late,
            absent: r.absent,
            half: r.half,
            status,
            percent: r.marked > 0 ? Math.round((attended / r.marked) * 100) : null
        };

    });

    const absentees = await pool.query(
        `
        SELECT s.id AS student_id, s.first_name, s.last_name, s.admission_no, s.parent_phone, s.father_name,
               c.class_name, sec.section_name,
               CASE WHEN d.ab * 2 > d.n THEN 'Absent' ELSE 'Half day' END AS state
          FROM (
                SELECT a.student_id, COUNT(*)::int AS n, COUNT(*) FILTER (WHERE a.status = 'Absent')::int AS ab
                  FROM attendance a JOIN students x ON x.id = a.student_id
                 WHERE x.school_id = $1 AND a.attendance_date = $2::date
                 GROUP BY a.student_id
               ) d
          JOIN students s ON s.id = d.student_id
          JOIN classes c ON c.id = s.class_id
          JOIN sections sec ON sec.id = s.section_id
         WHERE s.is_active = true AND (d.ab * 2 > d.n OR (d.n = 2 AND d.ab = 1))
         ORDER BY c.class_order, sec.section_name, s.first_name
        `,
        [schoolId, date]
    );

    const sum = rows.reduce((a, r) => ({
        on_roll: a.on_roll + r.on_roll,
        marked: a.marked + r.marked,
        present: a.present + r.present,
        late: a.late + r.late,
        absent: a.absent + r.absent
    }), { on_roll: 0, marked: 0, present: 0, late: 0, absent: 0 });

    return {
        date,
        summary: {
            ...sum,
            percent: sum.marked > 0 ? Math.round(((sum.present + sum.late) / sum.marked) * 100) : null,
            classes: rows.length,
            not_submitted: rows.filter((r) => r.status === "not_submitted").length,
            partial: rows.filter((r) => r.status === "partial").length
        },
        classes: rows,
        absentees: absentees.rows
    };

}

module.exports = { getBoard };
