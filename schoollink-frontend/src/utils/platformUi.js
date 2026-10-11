export function money(amount, currency = "INR") {

    const symbol = currency === "INR" ? "₹" : `${currency} `;

    return `${symbol}${Number(amount || 0).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

}

export function statusColor(status) {

    return {
        ACTIVE: "success",
        TRIAL: "info",
        SUSPENDED: "error",
        EXPIRED: "warning"
    }[status] || "default";

}

export function fmtDate(value) {

    if (!value) return "-";

    const d = new Date(String(value).length === 10 ? `${value}T00:00:00` : value);

    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

}

export function timeAgo(value) {

    if (!value) return "Never";

    const diff = Date.now() - new Date(value).getTime();

    const mins = Math.floor(diff / 60000);

    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins} min ago`;

    const hours = Math.floor(mins / 60);

    if (hours < 24) return `${hours} hr ago`;

    const days = Math.floor(hours / 24);

    if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;

    return fmtDate(value);

}

export function monthLabel(ym) {

    const [y, m] = ym.split("-");

    return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: "short" });

}

export function bytesLabel(bytes) {

    const n = Number(bytes || 0);

    if (n < 1024) return `${n} B`;
    if (n < 1048576) return `${(n / 1024).toFixed(0)} KB`;
    if (n < 1073741824) return `${(n / 1048576).toFixed(1)} MB`;

    return `${(n / 1073741824).toFixed(2)} GB`;

}

export function usd(amount) {

    const n = Number(amount || 0);

    return n > 0 && n < 0.01 ? "< $0.01" : `$${n.toFixed(2)}`;

}

const FIELD_LABELS = {
    subscription_plan: "Plan",
    status: "Status",
    subscription_expiry: "Expiry date",
    max_students: "Max students",
    max_teachers: "Max teachers",
    max_classes: "Max classes",
    max_storage_mb: "Max storage (MB)"
};

export function fieldLabel(field) {
    return FIELD_LABELS[field] || field;
}

export function fieldValue(field, value) {

    if (value === null || value === undefined || value === "") {
        return field.startsWith("max_") ? "Unlimited" : "None";
    }

    return field === "subscription_expiry" ? fmtDate(value) : String(value);

}

/** [{ label, from, to }] for a stored changes object */
export function changeLines(changes) {

    return Object.entries(changes || {}).map(([field, c]) => ({
        field,
        label: fieldLabel(field),
        from: fieldValue(field, c.from),
        to: fieldValue(field, c.to)
    }));

}
