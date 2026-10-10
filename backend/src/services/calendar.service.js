const db = require("../config/database");

const DEFAULT_OFF_DAYS = [0, 6];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function isValidDate(value) {

    if (typeof value !== "string" || !DATE_RE.test(value)) {
        return false;
    }

    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(Date.UTC(y, m - 1, d));

    return (
        date.getUTCFullYear() === y &&
        date.getUTCMonth() === m - 1 &&
        date.getUTCDate() === d
    );

}

function dayOfWeek(dateStr) {

    const [y, m, d] = dateStr.split("-").map(Number);

    return new Date(Date.UTC(y, m - 1, d)).getUTCDay();

}

/**
 * Pure helper - is `dateStr` a school day?
 * Precedence: "Working Day" entry > "Holiday" entry > weekly off day.
 */
function resolveDay(dateStr, weeklyOffDays, days) {

    const covering = days.filter(
        (d) => d.start_date <= dateStr && d.end_date >= dateStr
    );

    const working = covering.find((d) => d.kind === "Working Day");

    if (working) {
        return { date: dateStr, is_working: true, reason: null, name: working.name };
    }

    const holiday = covering.find((d) => d.kind === "Holiday");

    if (holiday) {
        return { date: dateStr, is_working: false, reason: "Holiday", name: holiday.name };
    }

    const dow = dayOfWeek(dateStr);

    if (weeklyOffDays.includes(dow)) {
        return {
            date: dateStr,
            is_working: false,
            reason: dow === 0 || dow === 6 ? "Weekend" : "Weekly off",
            name: null
        };
    }

    return { date: dateStr, is_working: true, reason: null, name: null };

}

async function getWeeklyOffDays(schoolId) {

    const result = await db.query(
        `SELECT weekly_off_days FROM school_calendar_settings WHERE school_id = $1`,
        [schoolId]
    );

    return result.rows[0] ? result.rows[0].weekly_off_days : DEFAULT_OFF_DAYS;

}

const DAY_COLUMNS = `
    id,
    school_id,
    to_char(start_date, 'YYYY-MM-DD') AS start_date,
    to_char(end_date, 'YYYY-MM-DD') AS end_date,
    kind,
    name
`;

async function listDays(schoolId, from, to) {

    const result = await db.query(
        `
        SELECT ${DAY_COLUMNS}
        FROM school_calendar_days
        WHERE school_id = $1
        AND end_date >= $2::date
        AND start_date <= $3::date
        ORDER BY start_date, id
        `,
        [schoolId, from, to]
    );

    return result.rows;

}

async function getCalendar(schoolId, from, to) {

    if (!isValidDate(from) || !isValidDate(to) || to < from) {
        throw new Error("Valid from and to dates (YYYY-MM-DD) are required.");
    }

    const [weekly_off_days, days] = await Promise.all([
        getWeeklyOffDays(schoolId),
        listDays(schoolId, from, to)
    ]);

    return { weekly_off_days, days };

}

async function getDayStatus(schoolId, dateStr) {

    const date = String(dateStr || "").slice(0, 10);

    if (!isValidDate(date)) {
        throw new Error("A valid date (YYYY-MM-DD) is required.");
    }

    const [weekly, days] = await Promise.all([
        getWeeklyOffDays(schoolId),
        listDays(schoolId, date, date)
    ]);

    return resolveDay(date, weekly, days);

}

/**
 * Human sentence for a non-working day, used in error messages.
 */
function describeOffDay(status) {

    if (status.reason === "Holiday") {
        return `${status.name} (school holiday)`;
    }

    return status.reason === "Weekend" ? "a weekend" : "a weekly off day";

}

async function updateWeeklyOff(schoolId, offDays) {

    if (!Array.isArray(offDays)) {
        throw new Error("weekly_off_days must be a list of day numbers.");
    }

    const clean = [...new Set(offDays.map(Number))]
        .filter((n) => Number.isInteger(n) && n >= 0 && n <= 6)
        .sort();

    if (clean.length !== new Set(offDays.map(Number)).size) {
        throw new Error("Days must be numbers from 0 (Sunday) to 6 (Saturday).");
    }

    if (clean.length > 6) {
        throw new Error("At least one day of the week must be a school day.");
    }

    await db.query(
        `
        INSERT INTO school_calendar_settings (school_id, weekly_off_days, updated_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (school_id)
        DO UPDATE SET weekly_off_days = EXCLUDED.weekly_off_days, updated_at = NOW()
        `,
        [schoolId, clean]
    );

    return clean;

}

function validateDayInput(data) {

    const kind = data.kind || "Holiday";

    if (!["Holiday", "Working Day"].includes(kind)) {
        throw new Error("Type must be Holiday or Working Day.");
    }

    const name = String(data.name || "").trim();

    if (!name) {
        throw new Error("Please enter a name, e.g. Deepavali.");
    }

    if (name.length > 150) {
        throw new Error("Name is too long.");
    }

    if (!isValidDate(data.start_date)) {
        throw new Error("A valid start date is required.");
    }

    const end = data.end_date || data.start_date;

    if (!isValidDate(end) || end < data.start_date) {
        throw new Error("End date cannot be before the start date.");
    }

    const spanDays =
        (Date.UTC(...end.split("-").map((n, i) => (i === 1 ? n - 1 : +n))) -
            Date.UTC(...data.start_date.split("-").map((n, i) => (i === 1 ? n - 1 : +n)))) /
        86400000;

    if (spanDays > 365) {
        throw new Error("A single entry can cover at most one year.");
    }

    return { kind, name, start_date: data.start_date, end_date: end };

}

async function getDay(id, schoolId) {

    const result = await db.query(
        `SELECT ${DAY_COLUMNS} FROM school_calendar_days WHERE id = $1 AND school_id = $2`,
        [id, schoolId]
    );

    return result.rows[0] || null;

}

async function createDay(schoolId, userId, data) {

    const v = validateDayInput(data);

    const result = await db.query(
        `
        INSERT INTO school_calendar_days
        (school_id, start_date, end_date, kind, name, created_by)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
        `,
        [schoolId, v.start_date, v.end_date, v.kind, v.name, userId]
    );

    return await getDay(result.rows[0].id, schoolId);

}

async function updateDay(id, schoolId, data) {

    const existing = await getDay(id, schoolId);

    if (!existing) {
        throw new Error("Calendar entry not found.");
    }

    const v = validateDayInput({
        kind: data.kind !== undefined ? data.kind : existing.kind,
        name: data.name !== undefined ? data.name : existing.name,
        start_date: data.start_date !== undefined ? data.start_date : existing.start_date,
        end_date: data.end_date !== undefined ? data.end_date : existing.end_date
    });

    await db.query(
        `
        UPDATE school_calendar_days
        SET start_date = $1, end_date = $2, kind = $3, name = $4
        WHERE id = $5 AND school_id = $6
        `,
        [v.start_date, v.end_date, v.kind, v.name, id, schoolId]
    );

    return { before: existing, after: await getDay(id, schoolId) };

}

async function deleteDay(id, schoolId) {

    const existing = await getDay(id, schoolId);

    if (!existing) {
        throw new Error("Calendar entry not found.");
    }

    await db.query(
        `DELETE FROM school_calendar_days WHERE id = $1 AND school_id = $2`,
        [id, schoolId]
    );

    return existing;

}

module.exports = {
    resolveDay,
    getCalendar,
    getDayStatus,
    describeOffDay,
    updateWeeklyOff,
    getWeeklyOffDays,
    createDay,
    updateDay,
    deleteDay,
    getDay
};
