import { Box } from "@mui/material";

const COLORS = {
    Pending: { fg: "#B45309", bg: "#FEF3C7" },
    Approved: { fg: "#15803D", bg: "#DCFCE7" },
    Declined: { fg: "#B91C1C", bg: "#FEE2E2" }
};

export function leaveDates(r) {
    const fmt = (d) => new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
    return r.from_date === r.to_date ? fmt(r.from_date) : `${fmt(r.from_date)} to ${fmt(r.to_date)}`;
}

export default function LeaveStatusPill({ status }) {
    const c = COLORS[status] || COLORS.Pending;
    return (
        <Box component="span" sx={{ display: "inline-block", px: 1.1, py: 0.2, borderRadius: 99, fontSize: "0.74rem", fontWeight: 700, color: c.fg, bgcolor: c.bg, whiteSpace: "nowrap" }}>
            {status}
        </Box>
    );
}
