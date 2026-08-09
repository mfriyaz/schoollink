/**
 * Safely parses a timestamp string as UTC.
 *
 * If the string already has a timezone marker (Z, or a +/-HH:MM
 * offset), it's parsed as-is. If it doesn't, JS's native
 * `new Date(str)` would otherwise silently treat it as LOCAL
 * time instead of UTC - which is exactly backwards for a value
 * that came from a `TIMESTAMP WITHOUT TIME ZONE` Postgres
 * column via a serialization path that dropped the Z. This
 * appends Z explicitly so parsing is always correct regardless
 * of the browser's own timezone.
 */
export function toUtcDate(dateString) {

    if (!dateString) {

        return null;

    }

    const hasTimezoneMarker = /Z$|[+-]\d{2}:?\d{2}$/.test(dateString);

    return new Date(hasTimezoneMarker ? dateString : `${dateString}Z`);

}

/**
 * Gets the logged-in user's school timezone from localStorage,
 * falling back to Singapore if it's missing (e.g. an older
 * session from before this was added).
 */
export function getSchoolTimezone() {

    const storedUser = localStorage.getItem("user");

    const user = storedUser ? JSON.parse(storedUser) : null;

    return (user && user.school_timezone) || "Asia/Singapore";

}

/**
 * Formats a timestamp as "Today, 8:30 AM" / "Yesterday, 2:15 PM"
 * / "Mar 4" for older dates, in a SPECIFIC timezone (the
 * school's, not the viewer's browser) - so a Super Admin in
 * India checking a Singapore school's posts sees Singapore
 * time, not their own.
 */
export function formatPostTime(dateString, timezone = getSchoolTimezone()) {

    const date = toUtcDate(dateString);

    const now = new Date();

    const dayFormatter = new Intl.DateTimeFormat("en-CA", {

        timeZone: timezone,

        year: "numeric",

        month: "2-digit",

        day: "2-digit"

    });

    const timeFormatter = new Intl.DateTimeFormat(undefined, {

        timeZone: timezone,

        hour: "numeric",

        minute: "2-digit"

    });

    const dateDay = dayFormatter.format(date);

    const today = dayFormatter.format(now);

    const yesterdayDate = new Date(now);

    yesterdayDate.setDate(now.getDate() - 1);

    const yesterday = dayFormatter.format(yesterdayDate);

    const timeLabel = timeFormatter.format(date);

    if (dateDay === today) {

        return `Today, ${timeLabel}`;

    }

    if (dateDay === yesterday) {

        return `Yesterday, ${timeLabel}`;

    }

    return new Intl.DateTimeFormat(undefined, {

        timeZone: timezone,

        month: "short",

        day: "numeric"

    }).format(date);

}
