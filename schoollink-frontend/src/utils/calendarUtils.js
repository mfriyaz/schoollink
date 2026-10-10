/**
 * Mirrors the backend rule (calendar.service.js resolveDay):
 * "Working Day" entry > "Holiday" entry > weekly off day.
 *
 * `key` is a "YYYY-MM-DD" string; `calendar` is the object returned by
 * GET /calendar: { weekly_off_days: number[], days: [...] }.
 */
export function dayOfWeekOf(key) {
    const [y, m, d] = key.split("-").map(Number);
    return new Date(y, m - 1, d).getDay();
}

export function dayInfo(key, calendar) {

    if (!calendar) {
        return { off: false, reason: null, name: null };
    }

    const covering = (calendar.days || []).filter(
        (d) => d.start_date <= key && d.end_date >= key
    );

    const working = covering.find((d) => d.kind === "Working Day");

    if (working) {
        return { off: false, reason: null, name: working.name, workingDay: true };
    }

    const holiday = covering.find((d) => d.kind === "Holiday");

    if (holiday) {
        return { off: true, reason: "Holiday", name: holiday.name };
    }

    const dow = dayOfWeekOf(key);

    if ((calendar.weekly_off_days || []).includes(dow)) {
        return { off: true, reason: dow === 0 || dow === 6 ? "Weekend" : "Weekly off", name: null };
    }

    return { off: false, reason: null, name: null };

}

export function prettyDate(key, options) {

    const [y, m, d] = key.split("-").map(Number);

    return new Date(y, m - 1, d).toLocaleDateString(
        "en-GB",
        options || { weekday: "short", day: "numeric", month: "short" }
    );

}

/** "YYYY-MM-DD" for a Date in the school's timezone */
export function dateKeyInZone(date, timeZone) {
    return new Intl.DateTimeFormat("en-CA", { timeZone }).format(date);
}
