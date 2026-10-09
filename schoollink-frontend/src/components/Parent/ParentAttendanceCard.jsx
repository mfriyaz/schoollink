import { useState } from "react";
import { Box, Card, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import EventBusyIcon from "@mui/icons-material/EventBusyOutlined";
import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";

const STATUS = {
    Present: { fg: "#16A34A", bg: "#DCFCE7", icon: <CheckCircleIcon /> },
    Late: { fg: "#EA580C", bg: "#FFEDD5", icon: <AccessTimeIcon /> },
    Absent: { fg: "#DC2626", bg: "#FEE2E2", icon: <CancelIcon /> }
};

const NOT_MARKED = { fg: "#64748B", bg: "#F1F5F9", icon: <EventBusyIcon /> };

const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

function styleFor(status) {
    return STATUS[status] || NOT_MARKED;
}

/**
 * Attendance for the selected child.
 * - Today: one clear status tile.
 * - This Month: attendance %, counts, a colour-coded month grid and
 *   a short list of only the Late / Absent days.
 */
function ParentAttendanceCard({ attendance }) {

    const [tab, setTab] = useState("today");

    const tz = getSchoolTimezone();

    const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz });
    const monthFmt = new Intl.DateTimeFormat("en-CA", { timeZone: tz, year: "numeric", month: "2-digit" });

    const now = new Date();
    const todayKey = dayFmt.format(now);
    const monthKey = monthFmt.format(now);

    // "2026-10-09" for each record
    const records = attendance.map((r) => ({
        ...r,
        key: dayFmt.format(toUtcDate(r.attendance_date))
    }));

    const todayRecord = records.find((r) => r.key === todayKey);
    const monthRecords = records.filter((r) => r.key.slice(0, 7) === monthKey);

    const byDay = {};
    monthRecords.forEach((r) => { byDay[r.key] = r; });

    const counts = { Present: 0, Late: 0, Absent: 0 };
    monthRecords.forEach((r) => {
        if (counts[r.status] !== undefined) counts[r.status]++;
    });

    const marked = counts.Present + counts.Late + counts.Absent;
    // Late still counts as attending the day
    const percent = marked > 0 ? Math.round(((counts.Present + counts.Late) / marked) * 100) : null;

    // Month grid
    const [yearStr, monthStr] = monthKey.split("-");
    const year = Number(yearStr);
    const month = Number(monthStr) - 1;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const monthLabel = new Date(year, month, 1).toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    const exceptions = monthRecords
        .filter((r) => r.status === "Late" || r.status === "Absent")
        .sort((a, b) => (a.key < b.key ? 1 : -1));

    const todayStyle = styleFor(todayRecord?.status);

    return (
        <Card
            sx={{
                p: { xs: 2, md: 2.5 },
                mb: 3,
                borderRadius: 3,
                border: "1px solid #EEF2F7",
                boxShadow: "0 1px 3px rgba(15,23,42,.06)"
            }}
        >

            {/* Header + toggle */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    flexWrap: "wrap",
                    mb: 1.75
                }}
            >
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.3 }}>
                        Attendance
                    </Typography>
                    <Typography sx={{ color: "#64748B", fontSize: "0.76rem" }}>
                        {tab === "today"
                            ? new Date().toLocaleDateString("en-GB", { timeZone: tz, weekday: "long", day: "numeric", month: "short" })
                            : monthLabel}
                    </Typography>
                </Box>

                <Box sx={{ display: "flex", p: 0.4, bgcolor: "#F1F5F9", borderRadius: 5 }}>
                    {[
                        { value: "today", label: "Today" },
                        { value: "month", label: "This Month" }
                    ].map((t) => (
                        <Box
                            key={t.value}
                            onClick={() => setTab(t.value)}
                            sx={{
                                px: 1.75,
                                py: 0.5,
                                borderRadius: 5,
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                bgcolor: tab === t.value ? "#FFFFFF" : "transparent",
                                color: tab === t.value ? "#2563EB" : "#64748B",
                                boxShadow: tab === t.value ? "0 1px 2px rgba(15,23,42,.1)" : "none"
                            }}
                        >
                            {t.label}
                        </Box>
                    ))}
                </Box>
            </Box>

            {/* ---------------- TODAY ---------------- */}
            {tab === "today" && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.75,
                        p: 1.75,
                        borderRadius: 2.5,
                        bgcolor: todayStyle.bg
                    }}
                >
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            minWidth: 44,
                            borderRadius: "12px",
                            bgcolor: "#FFFFFF",
                            color: todayStyle.fg,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "& svg": { fontSize: 24 }
                        }}
                    >
                        {todayStyle.icon}
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", color: todayStyle.fg, lineHeight: 1.2 }}>
                            {todayRecord ? todayRecord.status : "Not marked yet"}
                        </Typography>
                        <Typography sx={{ color: "#475569", fontSize: "0.8rem", mt: 0.25 }}>
                            {todayRecord
                                ? (todayRecord.remarks || "Marked by the class teacher")
                                : "The teacher hasn't marked attendance today."}
                        </Typography>
                    </Box>
                </Box>
            )}

            {/* ---------------- THIS MONTH ---------------- */}
            {tab === "month" && (
                monthRecords.length === 0 ? (
                    <Typography sx={{ color: "#94A3B8", fontSize: "0.88rem", py: 2 }}>
                        No attendance records for this month yet.
                    </Typography>
                ) : (
                    <Box>

                        {/* Summary */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 2 }}>

                            <Box sx={{ minWidth: 84 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "1.9rem", lineHeight: 1, color: "#0F172A" }}>
                                    {percent}%
                                </Typography>
                                <Typography sx={{ color: "#64748B", fontSize: "0.72rem", mt: 0.5 }}>
                                    attendance
                                </Typography>
                            </Box>

                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                                {["Present", "Late", "Absent"].map((s) => (
                                    <Box
                                        key={s}
                                        sx={{
                                            px: 1.25,
                                            py: 0.6,
                                            borderRadius: 2,
                                            bgcolor: STATUS[s].bg,
                                            minWidth: 64,
                                            textAlign: "center"
                                        }}
                                    >
                                        <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", color: STATUS[s].fg, lineHeight: 1.2 }}>
                                            {counts[s]}
                                        </Typography>
                                        <Typography sx={{ fontSize: "0.68rem", color: STATUS[s].fg, fontWeight: 600 }}>
                                            {s}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                        </Box>

                        {/* Month grid */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(7, 1fr)",
                                gap: 0.5,
                                maxWidth: 360
                            }}
                        >
                            {weekDays.map((w, i) => (
                                <Typography
                                    key={i}
                                    sx={{ textAlign: "center", color: "#94A3B8", fontSize: "0.68rem", fontWeight: 600 }}
                                >
                                    {w}
                                </Typography>
                            ))}

                            {cells.map((d, i) => {

                                if (!d) return <Box key={i} />;

                                const key = `${yearStr}-${monthStr}-${String(d).padStart(2, "0")}`;
                                const rec = byDay[key];
                                const st = rec ? STATUS[rec.status] : null;
                                const isToday = key === todayKey;

                                return (
                                    <Box
                                        key={i}
                                        title={rec ? `${d}: ${rec.status}` : undefined}
                                        sx={{
                                            aspectRatio: "1 / 1",
                                            maxHeight: 38,
                                            borderRadius: 1.5,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            fontSize: "0.76rem",
                                            fontWeight: rec || isToday ? 700 : 500,
                                            bgcolor: st ? st.bg : "#F8FAFC",
                                            color: st ? st.fg : "#94A3B8",
                                            border: isToday ? "2px solid #2563EB" : "2px solid transparent"
                                        }}
                                    >
                                        {d}
                                    </Box>
                                );
                            })}
                        </Box>

                        {/* Only the days that need attention */}
                        {exceptions.length > 0 && (
                            <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid #F1F5F9" }}>
                                <Typography
                                    sx={{
                                        color: "#64748B",
                                        fontSize: "0.7rem",
                                        fontWeight: 700,
                                        letterSpacing: 0.6,
                                        textTransform: "uppercase",
                                        mb: 0.75
                                    }}
                                >
                                    Late and absent days
                                </Typography>

                                {exceptions.map((r) => {
                                    const st = styleFor(r.status);
                                    return (
                                        <Box key={r.id || r.key} sx={{ display: "flex", alignItems: "center", gap: 1.25, py: 0.6 }}>
                                            <Box
                                                sx={{
                                                    width: 8, height: 8, minWidth: 8, borderRadius: "50%", bgcolor: st.fg
                                                }}
                                            />
                                            <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, minWidth: 92 }}>
                                                {new Date(`${r.key}T00:00:00`).toLocaleDateString("en-GB", {
                                                    weekday: "short", day: "numeric", month: "short"
                                                })}
                                            </Typography>
                                            <Typography sx={{ fontSize: "0.8rem", color: st.fg, fontWeight: 600 }}>
                                                {r.status}
                                            </Typography>
                                            {r.remarks && (
                                                <Typography sx={{ fontSize: "0.76rem", color: "#94A3B8", flex: 1, minWidth: 0 }} noWrap>
                                                    · {r.remarks}
                                                </Typography>
                                            )}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                    </Box>
                )
            )}

        </Card>
    );
}

export default ParentAttendanceCard;
