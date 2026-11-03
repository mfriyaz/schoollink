const pool = require("../config/database");
const notifier = require("./notifier.service");
const attention = require("./attention.service");

/**
 * Every Monday morning (school time, from 8 am) each class teacher gets one alert listing the
 * students of their own class who need attention and have not been followed up. Sent once per week.
 */

async function runOnce(opts = {}) {

    const sent = [];

    const schools = await pool.query(
        `SELECT s.id,
                (NOW() AT TIME ZONE COALESCE(NULLIF(s.timezone, ''), 'UTC'))::date::text AS today,
                EXTRACT(ISODOW FROM (NOW() AT TIME ZONE COALESCE(NULLIF(s.timezone, ''), 'UTC')))::int AS dow,
                EXTRACT(HOUR FROM (NOW() AT TIME ZONE COALESCE(NULLIF(s.timezone, ''), 'UTC')))::int AS hour
           FROM schools s
          WHERE COALESCE(s.status, 'ACTIVE') IN ('ACTIVE', 'TRIAL')
            AND s.id NOT IN (SELECT u.school_id FROM users u JOIN roles r ON r.id = u.role_id WHERE r.role_name = 'Super Admin')`
    );

    for (const s of schools.rows) {

        if (!opts.force && (s.dow !== 1 || s.hour < 8)) continue;

        const teachers = await pool.query(
            `SELECT DISTINCT t.user_id AS id
               FROM teacher_subjects ts JOIN teachers t ON t.id = ts.teacher_id
              WHERE t.school_id = $1 AND ts.is_class_teacher = true AND ts.ended_at IS NULL
                AND t.user_id IS NOT NULL AND t.is_active = true`,
            [s.id]
        );

        for (const t of teachers.rows) {

            const link = `/early-warning?week=${s.today}`;

            const already = await pool.query("SELECT 1 FROM notifications WHERE user_id = $1 AND link = $2 LIMIT 1", [t.id, link]);

            if (already.rows.length > 0) continue;

            const data = await attention.list({ id: t.id, school_id: s.id, role: "Teacher" }, {});

            if (data.items.length === 0) continue;

            const names = data.items.slice(0, 3).map((i) => i.first_name).join(", ");

            const more = data.items.length > 3 ? ` and ${data.items.length - 3} more` : "";

            const message = `${data.items.length} ${data.items.length === 1 ? "student" : "students"} in your class need${data.items.length === 1 ? "s" : ""} attention: ${names}${more}.`;

            try {
                await notifier.notifyIfEnabled(t.id, "Students needing attention", message, message, link, { email: false });
                sent.push(t.id);
            } catch (err) {
                console.error("Attention digest failed:", err.message);
            }

        }

    }

    return sent;

}

let running = false;

async function safeRun() {

    if (running) return;

    running = true;

    try {

        const sent = await runOnce();

        if (sent.length) console.log("Attention digest sent to", sent.length, "class teacher(s)");

    } catch (err) {

        console.error("Attention digest failed:", err.message);

    } finally {

        running = false;

    }

}

function start() {

    const first = setTimeout(safeRun, 90 * 1000);

    const timer = setInterval(safeRun, 60 * 60 * 1000);

    if (first.unref) first.unref();

    if (timer.unref) timer.unref();

}

module.exports = { runOnce, start };
