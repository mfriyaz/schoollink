const pool = require("../config/database");
const insights = require("./insights.service");
const notifier = require("./notifier.service");
const emailService = require("./email.service");
const { clearSchoolAccessCache } = require("../utils/schoolAccess");

/**
 * Subscription follow-up, run automatically every hour.
 *
 *  - 7 days before the expiry date: one reminder to the school admins ("before")
 *  - on/after the expiry date, inside the grace period: one notice ("expired")
 *  - after the grace period: one final notice that the school will be locked ("final")
 *  - at least 24 hours after the final notice: the school is set to EXPIRED and locked ("locked"),
 *    and the Super Admin is told.
 *
 * A school is never locked without having had the final notice for a full day first.
 * Each notice is sent once per expiry date (renewing the date starts the cycle again).
 * Schools with no expiry date, schools already suspended/expired, and the platform school are left alone.
 */

function graceDays() {
    const n = Number(process.env.SUBSCRIPTION_GRACE_DAYS);
    return Number.isInteger(n) && n >= 0 && n <= 60 ? n : 7;
}

const dayDiff = (a, b) => Math.round((new Date(`${a}T00:00:00Z`) - new Date(`${b}T00:00:00Z`)) / 86400000);

/** Returns true if this call recorded the alert (i.e. it had not been sent before) */
async function markSent(schoolId, kind, expiry) {

    const r = await pool.query(
        `INSERT INTO subscription_alerts (school_id, kind, expiry_date) VALUES ($1, $2, $3::date)
         ON CONFLICT DO NOTHING RETURNING 1`,
        [schoolId, kind, expiry]
    );

    return r.rows.length > 0;

}

async function schoolAdmins(schoolId) {

    const r = await pool.query(
        `SELECT u.id FROM users u JOIN roles r ON r.id = u.role_id
          WHERE u.school_id = $1 AND r.role_name = 'School Admin' AND u.is_active = true`,
        [schoolId]
    );

    return r.rows.map((x) => x.id);

}

async function notifyAdmins(schoolId, title, message) {

    for (const id of await schoolAdmins(schoolId)) {
        try {
            await notifier.notifyIfEnabled(id, title, message, message, "/dashboard");
        } catch (err) {
            console.error("Subscription notice failed:", err.message);
        }
    }

}

async function emailSuperAdmins(subject, body) {

    const r = await pool.query(
        `SELECT DISTINCT u.email FROM users u JOIN roles r ON r.id = u.role_id
          WHERE r.role_name = 'Super Admin' AND u.is_active = true AND u.email IS NOT NULL`
    );

    for (const row of r.rows) {
        try {
            await emailService.sendEmail(row.email, subject, body);
        } catch (err) {
            console.error("Super Admin email failed:", err.message);
        }
    }

}

async function lockSchool(school, daysOver) {

    const upd = await pool.query(
        `UPDATE schools SET status = 'EXPIRED', updated_at = CURRENT_TIMESTAMP
          WHERE id = $1 AND COALESCE(status, 'ACTIVE') IN ('ACTIVE', 'TRIAL') RETURNING id`,
        [school.id]
    );

    if (upd.rows.length === 0) return false;

    clearSchoolAccessCache();

    try {
        await pool.query(
            `INSERT INTO school_subscription_history (school_id, changed_by, changed_by_name, source, changes, reason)
             VALUES ($1, NULL, 'Automatic', 'auto-lock', $2, $3)`,
            [school.id, JSON.stringify({ status: { from: school.status || "ACTIVE", to: "EXPIRED" } }),
                `Subscription expired ${daysOver} days ago and the grace period ended`]
        );
    } catch (err) {
        console.error("Auto-lock history failed:", err.message);
    }

    return true;

}

/** One pass over all schools. Returns what it did (used by tests and logs). */
async function runOnce() {

    const grace = graceDays();

    const result = { before: [], expired: [], final: [], locked: [] };

    const schools = await pool.query(
        `SELECT s.id, s.school_name, COALESCE(s.status, 'ACTIVE') AS status,
                s.subscription_expiry::date::text AS expiry
           FROM schools s
          WHERE s.subscription_expiry IS NOT NULL
            AND COALESCE(s.status, 'ACTIVE') IN ('ACTIVE', 'TRIAL')
            AND s.id NOT IN (SELECT u.school_id FROM users u JOIN roles r ON r.id = u.role_id WHERE r.role_name = 'Super Admin')`
    );

    for (const s of schools.rows) {

        const today = await insights.schoolToday(s.id);

        const daysLeft = dayDiff(s.expiry, today);

        const over = -daysLeft;

        const renewMsg = "Please contact SchoolLink support to renew.";

        if (daysLeft > 0 && daysLeft <= 7) {

            if (await markSent(s.id, "before", s.expiry)) {
                await notifyAdmins(s.id, "Subscription ending soon",
                    `Your SchoolLink subscription ends on ${s.expiry} (${daysLeft} ${daysLeft === 1 ? "day" : "days"} left). ${renewMsg}`);
                result.before.push(s.id);
            }

        } else if (over >= 0 && over <= grace) {

            if (await markSent(s.id, "expired", s.expiry)) {
                const lastDay = new Date(`${s.expiry}T00:00:00Z`);
                lastDay.setUTCDate(lastDay.getUTCDate() + grace);
                await notifyAdmins(s.id, "Subscription has ended",
                    `Your SchoolLink subscription ended on ${s.expiry}. SchoolLink keeps working until ${lastDay.toISOString().slice(0, 10)}, then it will be locked. ${renewMsg}`);
                result.expired.push(s.id);
            }

        } else if (over > grace) {

            // grace is over: warn first, lock only after the warning is a day old
            if (await markSent(s.id, "final", s.expiry)) {
                await notifyAdmins(s.id, "SchoolLink will be locked",
                    `Your SchoolLink subscription ended on ${s.expiry} and the grace period is over. Access will be locked within 24 hours unless renewed. ${renewMsg}`);
                await emailSuperAdmins(`SchoolLink: ${s.school_name} will be locked`,
                    `${s.school_name}'s subscription ended on ${s.expiry}. It will be locked automatically in about 24 hours unless you renew it.`);
                result.final.push(s.id);
                continue;
            }

            const due = await pool.query(
                `SELECT 1 FROM subscription_alerts
                  WHERE school_id = $1 AND kind = 'final' AND expiry_date = $2::date
                    AND sent_at <= CURRENT_TIMESTAMP - INTERVAL '24 hours'`,
                [s.id, s.expiry]
            );

            if (due.rows.length > 0 && await lockSchool(s, over)) {
                await markSent(s.id, "locked", s.expiry);
                await emailSuperAdmins(`SchoolLink: ${s.school_name} was locked`,
                    `${s.school_name} was locked automatically because its subscription ended on ${s.expiry}. Set the school back to ACTIVE after renewing.`);
                result.locked.push(s.id);
            }

        }

    }

    return result;

}

let running = false;

async function safeRun() {

    if (running) return;

    running = true;

    try {

        const r = await runOnce();

        if (r.before.length || r.expired.length || r.final.length || r.locked.length) {
            console.log("Subscription follow-up:", JSON.stringify(r));
        }

    } catch (err) {

        console.error("Subscription follow-up failed:", err.message);

    } finally {

        running = false;

    }

}

/** Start the hourly job. Set SUBSCRIPTION_AUTOLOCK=off to disable it. */
function start() {

    if (String(process.env.SUBSCRIPTION_AUTOLOCK || "").toLowerCase() === "off") {
        console.log("Subscription follow-up is switched off.");
        return;
    }

    const first = setTimeout(safeRun, 60 * 1000);

    const timer = setInterval(safeRun, 60 * 60 * 1000);

    if (first.unref) first.unref();

    if (timer.unref) timer.unref();

}

module.exports = { runOnce, start, graceDays };
