import { useEffect, useState } from "react";

import { Box, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EventBusyIcon from "@mui/icons-material/EventBusyOutlined";

import { getSubscriptionNotice } from "../../services/themeService";

const KEY = "sl_sub_banner_dismissed";

function dayStamp() {
    return new Date().toISOString().slice(0, 10);
}

/**
 * School Admin only: a renewal reminder from 30 days before the subscription
 * ends. After the end date it turns red. The early reminder (more than 7 days
 * left) can be closed for the day; the last 7 days and overdue cannot.
 */
export default function SubscriptionBanner() {

    const [info, setInfo] = useState(null);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        let alive = true;
        getSubscriptionNotice()
            .then((r) => { if (alive) setInfo(r.data); })
            .catch(() => {});
        try { if (sessionStorage.getItem(KEY) === dayStamp()) setHidden(true); } catch { /* ignore */ }
        return () => { alive = false; };
    }, []);

    if (!info || info.days_left === null || info.days_left === undefined || info.days_left > 30) return null;

    const d = info.days_left;
    const overdue = d < 0;
    const urgent = d <= 7;

    if (hidden && !urgent) return null;

    const dateText = info.expiry
        ? new Date(`${info.expiry}T00:00:00`).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
        : "";

    const text = overdue
        ? `Your subscription ended on ${dateText} (${-d} day${-d === 1 ? "" : "s"} ago). Please renew with SchoolLink to avoid interruption.`
        : d === 0
            ? "Your subscription ends today. Please renew with SchoolLink to avoid interruption."
            : `Your subscription ends on ${dateText} (${d} day${d === 1 ? "" : "s"} left). Please contact SchoolLink to renew.`;

    const red = overdue || d <= 7;

    return (
        <Box
            role="status"
            sx={{
                display: "flex", alignItems: "center", gap: 1.25, mb: 2, px: 1.75, py: 1.1,
                borderRadius: 3, border: "1.5px solid", borderColor: red ? "#DC2626" : "#F59E0B",
                bgcolor: red ? "#FEF2F2" : "#FFFBEB"
            }}
        >
            <EventBusyIcon sx={{ color: red ? "#DC2626" : "#B45309", flexShrink: 0 }} />
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "0.88rem", color: red ? "#991B1B" : "#92400E" }}>
                    {overdue ? "Subscription expired" : "Renewal reminder"}
                </Typography>
                <Typography sx={{ fontSize: "0.82rem", color: red ? "#7F1D1D" : "#78350F" }}>{text}</Typography>
            </Box>
            {!urgent && (
                <IconButton
                    size="small"
                    aria-label="Hide for today"
                    onClick={() => { setHidden(true); try { sessionStorage.setItem(KEY, dayStamp()); } catch { /* ignore */ } }}
                >
                    <CloseIcon fontSize="small" />
                </IconButton>
            )}
        </Box>
    );
}
