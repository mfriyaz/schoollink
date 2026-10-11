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
