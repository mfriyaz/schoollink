const crypto = require("crypto");
const bcrypt = require("bcrypt");

const pool = require("../config/database");
const userModel = require("../models/user.model");
const { clearSchoolAccessCache } = require("../utils/schoolAccess");

const SCHOOL_USAGE_SQL = `
    SELECT
        s.id,
        s.school_name,
        s.school_code,
        s.city,
        s.state,
        s.country,
        s.email,
        s.phone,
        s.timezone,
        COALESCE(s.status, 'ACTIVE') AS status,
        COALESCE(s.subscription_plan, 'STANDARD') AS subscription_plan,
        to_char(s.subscription_expiry, 'YYYY-MM-DD') AS subscription_expiry,
        s.max_students,
        s.max_teachers,
        s.max_classes,
        s.internal_notes,
        s.created_at,
        (SELECT COUNT(*)::int FROM students st
            WHERE st.school_id = s.id AND st.is_active) AS students,
        (SELECT COUNT(*)::int FROM teachers t
            WHERE t.school_id = s.id AND t.is_active) AS teachers,
        (SELECT COUNT(*)::int FROM classes c
            WHERE c.school_id = s.id AND c.is_active) AS classes,
        (SELECT COUNT(DISTINCT ps.parent_user_id)::int
            FROM parent_students ps
            JOIN students st ON st.id = ps.student_id
            WHERE st.school_id = s.id) AS parents,
        (SELECT MAX(u.last_login) FROM users u
            JOIN roles r ON r.id = u.role_id
            WHERE u.school_id = s.id AND r.role_name <> 'Super Admin') AS last_login
    FROM schools s
    WHERE s.is_active = true
`;

function todayStr() {

    return new Date().toISOString().slice(0, 10);

}

function daysBetween(fromStr, toStr) {

    return Math.round(
        (new Date(toStr) - new Date(fromStr)) / 86400000
    );

}

function usagePercent(used, limit) {

    if (!limit) return null;

    return Math.round((used / limit) * 100);

}

async function listSchools() {

    const result = await pool.query(SCHOOL_USAGE_SQL + " ORDER BY s.id");

    return result.rows;

}

async function getOverview() {

    const schools = await listSchools();

    const today = todayStr();

    const byStatus = {};
    const byPlan = {};

    const expiringSoon = [];
    const expiredByDate = [];
    const nearLimit = [];
    const inactive = [];

    let students = 0, teachers = 0, parents = 0, classes = 0;

    const thirtyDaysAgo = Date.now() - 30 * 86400000;

    for (const s of schools) {

        byStatus[s.status] = (byStatus[s.status] || 0) + 1;
        byPlan[s.subscription_plan] = (byPlan[s.subscription_plan] || 0) + 1;

        students += s.students;
        teachers += s.teachers;
        parents += s.parents;
        classes += s.classes;

        if (s.subscription_expiry) {

            const days = daysBetween(today, s.subscription_expiry);

            if (days < 0 && !["SUSPENDED", "EXPIRED"].includes(s.status)) {

                expiredByDate.push({ ...brief(s), days_overdue: -days });

            } else if (days >= 0 && days <= 30 && s.status !== "SUSPENDED") {

                expiringSoon.push({ ...brief(s), days_left: days });

            }

        }

        for (const [key, label, used, limit] of [
            ["students", "Students", s.students, s.max_students],
            ["teachers", "Teachers", s.teachers, s.max_teachers],
            ["classes", "Classes", s.classes, s.max_classes]
        ]) {

            const pct = usagePercent(used, limit);

            if (pct !== null && pct >= 90) {

                nearLimit.push({ ...brief(s), resource: label, used, limit, percent: pct });

            }

        }

        if (s.status !== "SUSPENDED") {

            const last = s.last_login ? new Date(s.last_login).getTime() : null;

            if (!last || last < thirtyDaysAgo) {

                inactive.push({ ...brief(s), last_login: s.last_login });

            }

        }

    }

    const growthResult = await pool.query(`
        SELECT to_char(m, 'YYYY-MM') AS month,
               COALESCE(c.cnt, 0)::int AS schools
        FROM generate_series(
                date_trunc('month', CURRENT_DATE) - interval '11 months',
                date_trunc('month', CURRENT_DATE),
                interval '1 month') AS m
        LEFT JOIN (
            SELECT date_trunc('month', created_at) AS mm, COUNT(*) AS cnt
            FROM schools WHERE is_active = true GROUP BY 1
        ) c ON c.mm = m
        ORDER BY m
    `);

    const revenueSeries = await pool.query(`
        SELECT to_char(m, 'YYYY-MM') AS month,
               COALESCE(r.total, 0)::float AS amount
        FROM generate_series(
                date_trunc('month', CURRENT_DATE) - interval '11 months',
                date_trunc('month', CURRENT_DATE),
                interval '1 month') AS m
        LEFT JOIN (
            SELECT date_trunc('month', paid_on) AS mm, SUM(amount) AS total
            FROM school_payments GROUP BY 1
        ) r ON r.mm = m
        ORDER BY m
    `);

    const revenueTotals = await pool.query(`
        SELECT
            COALESCE(SUM(amount) FILTER (
                WHERE date_trunc('month', paid_on) = date_trunc('month', CURRENT_DATE)
            ), 0)::float AS this_month,
            COALESCE(SUM(amount) FILTER (
                WHERE paid_on >= CURRENT_DATE - interval '365 days'
            ), 0)::float AS last_12_months,
            COALESCE(SUM(amount), 0)::float AS all_time,
            COUNT(*)::int AS payments
        FROM school_payments
    `);

    const activity = await pool.query(`
        SELECT id, actor_name, school_id, school_name, action, summary, created_at
        FROM platform_activity
        ORDER BY created_at DESC
        LIMIT 15
    `);

    expiringSoon.sort((a, b) => a.days_left - b.days_left);
    expiredByDate.sort((a, b) => b.days_overdue - a.days_overdue);

    return {
        totals: {
            schools: schools.length,
            students,
            teachers,
            parents,
            classes
        },
        by_status: byStatus,
        by_plan: byPlan,
        attention: {
            expired_by_date: expiredByDate,
            expiring_soon: expiringSoon,
            near_limit: nearLimit,
            inactive
        },
        growth: growthResult.rows,
        revenue: {
            ...revenueTotals.rows[0],
            series: revenueSeries.rows
        },
        recent_activity: activity.rows
    };

}

function brief(s) {

    return {
        id: s.id,
        school_name: s.school_name,
        status: s.status,
        plan: s.subscription_plan,
        subscription_expiry: s.subscription_expiry
    };

}

async function getSchoolDetail(id) {

    const result = await pool.query(
        SCHOOL_USAGE_SQL + " AND s.id = $1",
        [id]
    );

    const school = result.rows[0];

    if (!school) return null;

    const admins = await pool.query(
        `
        SELECT u.id, u.full_name, u.email, u.username, u.mobile,
               u.is_active, u.last_login
        FROM users u
        JOIN roles r ON r.id = u.role_id
        WHERE u.school_id = $1 AND r.role_name = 'School Admin'
        ORDER BY u.id
        `,
        [id]
    );

    const payments = await pool.query(
        `
        SELECT id, amount::float AS amount, currency,
               to_char(paid_on, 'YYYY-MM-DD') AS paid_on,
               to_char(period_start, 'YYYY-MM-DD') AS period_start,
               to_char(period_end, 'YYYY-MM-DD') AS period_end,
               method, reference, notes, plan, recorded_by_name, created_at
        FROM school_payments
        WHERE school_id = $1
        ORDER BY paid_on DESC, id DESC
        `,
        [id]
    );

    const activity = await pool.query(
        `
        SELECT id, actor_name, action, summary, created_at
        FROM platform_activity
        WHERE school_id = $1
        ORDER BY created_at DESC
        LIMIT 20
        `,
        [id]
    );

    const recentUsage = await pool.query(
        `
        SELECT COUNT(*)::int AS actions_30d
        FROM audit_logs
        WHERE school_id = $1 AND created_at >= NOW() - interval '30 days'
        `,
        [id]
    ).catch(() => ({ rows: [{ actions_30d: null }] }));

    return {
        school,
        admins: admins.rows,
        payments: payments.rows,
        activity: activity.rows,
        actions_30d: recentUsage.rows[0].actions_30d
    };

}

async function logActivity(req, school, action, summary) {

    try {

        const actor = await pool.query(
            `SELECT full_name FROM users WHERE id = $1`,
            [req.user.id]
        );

        await pool.query(
            `
            INSERT INTO platform_activity
            (actor_id, actor_name, school_id, school_name, action, summary)
            VALUES ($1, $2, $3, $4, $5, $6)
            `,
            [
                req.user.id,
                actor.rows[0]?.full_name || "Super Admin",
                school?.id || null,
                school?.school_name || null,
                action,
                summary
            ]
        );

    } catch (err) {

        console.error("platform activity log failed:", err.message);

    }

}

/** Log "viewed records" at most once per 30 min per actor + school */
async function logRecordsView(req, school) {

    try {

        const recent = await pool.query(
            `
            SELECT 1 FROM platform_activity
            WHERE actor_id = $1 AND school_id = $2 AND action = 'view_records'
              AND created_at > NOW() - interval '30 minutes'
            LIMIT 1
            `,
            [req.user.id, school.id]
        );

        if (recent.rows.length === 0) {

            await logActivity(req, school, "view_records", `Viewed the records of ${school.school_name}`);

        }

    } catch (err) {

        console.error("records view log failed:", err.message);

    }

}

async function getSchoolBrief(id) {

    const r = await pool.query(
        `SELECT id, school_name FROM schools WHERE id = $1`,
        [id]
    );

    return r.rows[0] || null;

}

async function setStatus(req, id, status, reason) {

    const allowed = ["ACTIVE", "SUSPENDED", "TRIAL", "EXPIRED"];

    if (!allowed.includes(status)) {

        throw new Error("Invalid status");

    }

    const school = await getSchoolBrief(id);

    if (!school) return null;

    await pool.query(`UPDATE schools SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`, [status, id]);

    clearSchoolAccessCache();

    await logActivity(
        req, school, "status_change",
        `Set ${school.school_name} to ${status}${reason ? ` - ${reason}` : ""}`
    );

    return true;

}

async function addPayment(req, schoolId, p) {

    const school = await getSchoolBrief(schoolId);

    if (!school) return null;

    const amount = Number(p.amount);

    if (!Number.isFinite(amount) || amount < 0) {

        throw new Error("Enter a valid amount");

    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");

        const actor = await client.query(`SELECT full_name FROM users WHERE id = $1`, [req.user.id]);

        const inserted = await client.query(
            `
            INSERT INTO school_payments
            (school_id, amount, currency, paid_on, period_start, period_end,
             method, reference, notes, plan, recorded_by, recorded_by_name)
            VALUES ($1, $2, $3, COALESCE($4::date, CURRENT_DATE), $5, $6,
                    $7, $8, $9, $10, $11, $12)
            RETURNING id
            `,
            [
                schoolId,
                amount,
                (p.currency || "INR").toUpperCase().slice(0, 3),
                p.paid_on || null,
                p.period_start || null,
                p.period_end || null,
                p.method || null,
                p.reference || null,
                p.notes || null,
                p.plan || null,
                req.user.id,
                actor.rows[0]?.full_name || null
            ]
        );

        if (p.update_expiry && p.period_end) {

            await client.query(
                `
                UPDATE schools
                SET subscription_expiry = $1::date,
                    status = CASE WHEN $2::boolean THEN 'ACTIVE' ELSE status END,
                    subscription_plan = COALESCE($4, subscription_plan),
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $3
                `,
                [p.period_end, Boolean(p.reactivate), schoolId, p.plan || null]
            );

        }

        await client.query("COMMIT");

        clearSchoolAccessCache();

        await logActivity(
            req, school, "payment",
            `Recorded payment of ${(p.currency || "INR").toUpperCase()} ${amount} for ${school.school_name}` +
            (p.update_expiry && p.period_end ? ` (valid until ${p.period_end})` : "")
        );

        return inserted.rows[0];

    } catch (err) {

        await client.query("ROLLBACK");

        throw err;

    } finally {

        client.release();

    }

}

async function deletePayment(req, paymentId) {

    const r = await pool.query(
        `
        DELETE FROM school_payments sp
        USING schools s
        WHERE sp.id = $1 AND s.id = sp.school_id
        RETURNING sp.amount::float AS amount, sp.currency, s.id, s.school_name
        `,
        [paymentId]
    );

    const row = r.rows[0];

    if (!row) return false;

    await logActivity(
        req, { id: row.id, school_name: row.school_name }, "payment_deleted",
        `Deleted a payment of ${row.currency} ${row.amount} for ${row.school_name}`
    );

    return true;

}

async function listPayments({ from, to, school_id } = {}) {

    const where = [];
    const params = [];

    if (school_id) { params.push(school_id); where.push(`sp.school_id = $${params.length}`); }
    if (from) { params.push(from); where.push(`sp.paid_on >= $${params.length}`); }
    if (to) { params.push(to); where.push(`sp.paid_on <= $${params.length}`); }

    const result = await pool.query(
        `
        SELECT sp.id, sp.school_id, s.school_name,
               sp.amount::float AS amount, sp.currency,
               to_char(sp.paid_on, 'YYYY-MM-DD') AS paid_on,
               to_char(sp.period_start, 'YYYY-MM-DD') AS period_start,
               to_char(sp.period_end, 'YYYY-MM-DD') AS period_end,
               sp.method, sp.reference, sp.notes, sp.plan, sp.recorded_by_name
        FROM school_payments sp
        JOIN schools s ON s.id = sp.school_id
        ${where.length ? "WHERE " + where.join(" AND ") : ""}
        ORDER BY sp.paid_on DESC, sp.id DESC
        LIMIT 500
        `,
        params
    );

    return result.rows;

}

async function updateNotes(req, id, notes) {

    const school = await getSchoolBrief(id);

    if (!school) return null;

    await pool.query(
        `UPDATE schools SET internal_notes = $1 WHERE id = $2`,
        [notes || null, id]
    );

    await logActivity(req, school, "notes", `Updated internal notes for ${school.school_name}`);

    return true;

}

function generateTempPassword() {

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    let out = "";

    for (let i = 0; i < 10; i++) out += chars[crypto.randomInt(chars.length)];

    return out;

}

/** Super Admin resets a School Admin's password */
async function resetSchoolAdminPassword(req, userId) {

    const target = await userModel.findUserById(userId);

    if (!target || target.role_name !== "School Admin") return null;

    const temp = generateTempPassword();

    await userModel.updateUserPassword(target.id, await bcrypt.hash(temp, 10));

    await logActivity(
        req,
        { id: target.school_id, school_name: target.school_name },
        "reset_password",
        `Reset the password of School Admin ${target.full_name} (${target.school_name})`
    );

    return temp;

}

module.exports = {
    getOverview,
    listSchools,
    getSchoolDetail,
    setStatus,
    addPayment,
    deletePayment,
    listPayments,
    updateNotes,
    resetSchoolAdminPassword,
    logActivity,
    logRecordsView,
    getSchoolBrief
};
