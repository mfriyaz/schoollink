import { useEffect, useMemo, useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import EventAvailableIcon from "@mui/icons-material/EventAvailableOutlined";
import PanelCard from "./PanelCard";
import { getAllExams } from "../../services/examService";
import { getCalendar } from "../../services/calendarService";
import { dayInfo } from "../../utils/calendarUtils";

const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

const EXAM_COLOR = "#EA580C";
const ANNOUNCEMENT_COLOR = "#DB2777";
const HOLIDAY_COLOR = "#7C3AED";

const TYPE_COLOR = { exam: EXAM_COLOR, announcement: ANNOUNCEMENT_COLOR, holiday: HOLIDAY_COLOR, workday: "#16A34A" };

function pad(n) {
    return String(n).padStart(2, "0");
}

function dateKey(year, month, day) {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
}

function toKey(value) {
    // Dates arrive as "2026-10-12" or "2026-10-12T00:00:00.000Z"
    return value ? String(value).slice(0, 10) : null;
}

function addDays(key, n) {
    const d = new Date(`${key}T00:00:00`);
    d.setDate(d.getDate() + n);
    return dateKey(d.getFullYear(), d.getMonth(), d.getDate());
}

function prettyDate(key) {
    return new Date(`${key}T00:00:00`).toLocaleDateString("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short"
    });
}

/**
 * School calendar: shows exam dates and announcement dates for the
 * month. Click a day to see what is on it. "Coming up" lists the
 * next few things so the admin sees what is ahead at a glance.
 */
function CalendarCard({ announcements = [] }) {

    const today = new Date();
    const todayKey = dateKey(today.getFullYear(), today.getMonth(), today.getDate());

    const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
    const [selected, setSelected] = useState(todayKey);
    const [exams, setExams] = useState([]);
    const [monthCal, setMonthCal] = useState(null);
    const [upcomingCal, setUpcomingCal] = useState(null);

    useEffect(() => {
        async function loadExams() {
            try {
                const response = await getAllExams();
                if (response.success) {
                    setExams(response.data || []);
                }
            } catch (err) {
                console.error(err);
            }
        }
        loadExams();
    }, []);

    // Holidays / weekly off days for the month being viewed
    useEffect(() => {
        const y = view.getFullYear();
        const m = view.getMonth();
        const last = new Date(y, m + 1, 0).getDate();
        getCalendar(dateKey(y, m, 1), dateKey(y, m, last))
            .then((r) => { if (r.success) setMonthCal(r.data); })
            .catch((err) => console.error(err));
    }, [view]);

    // Holidays in the next 90 days (for "Coming up")
    useEffect(() => {
        getCalendar(todayKey, addDays(todayKey, 90))
            .then((r) => { if (r.success) setUpcomingCal(r.data); })
            .catch((err) => console.error(err));
    }, []);

    // Build { "2026-10-12": [ {type, title}, ... ] }
    const events = useMemo(() => {

        const map = {};

        function add(key, event) {
            if (!key) return;
            if (!map[key]) map[key] = [];
            map[key].push(event);
        }

        exams.forEach((exam) => {
            const start = toKey(exam.start_date);
            const end = toKey(exam.end_date) || start;
            if (!start) return;

            let key = start;
            let guard = 0;
            while (key <= end && guard < 60) {
                add(key, {
                    type: "exam",
                    title: exam.exam_name,
                    note: key === start ? "Exam starts" : key === end ? "Exam ends" : "Exam day"
                });
                key = addDays(key, 1);
                guard++;
            }
        });

        [monthCal, upcomingCal].forEach((cal, calIndex) => {
            if (!cal) return;
            const seen = calIndex === 1 ? new Set() : null;
            (cal.days || []).forEach((d) => {
                let key = d.start_date;
                let guard = 0;
                while (key <= d.end_date && guard < 370) {
                    const type = d.kind === "Holiday" ? "holiday" : "workday";
                    const id = `${key}|${d.id}`;
                    const already = (map[key] || []).some((e) => e.id === id);
                    if (!already) {
                        add(key, {
                            id,
                            calId: d.id,
                            type,
                            title: d.name,
                            note: type === "holiday" ? "School closed" : "School open"
                        });
                    }
                    key = addDays(key, 1);
                    guard++;
                }
            });
        });

        announcements.forEach((a) => {
            add(toKey(a.publish_date), {
                type: "announcement",
                title: a.title,
                note: "Announcement"
            });
        });

        return map;

    }, [exams, announcements, monthCal, upcomingCal]);

    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const monthLabel = view.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    const selectedInfo = dayInfo(selected, monthCal || upcomingCal);
    const selectedEvents = [
        ...(events[selected] || []),
        ...(selectedInfo.off && selectedInfo.reason !== "Holiday"
            ? [{ type: "weekend", title: selectedInfo.reason, note: "No school" }]
            : [])
    ];

    // A multi-day holiday should appear once in "Coming up", not once per day
    const seenCalIds = new Set();

    const upcoming = Object.keys(events)
        .filter((k) => k >= todayKey)
        .sort()
        .filter((k) => {
            const first = events[k][0];
            if (!first.calId) return true;
            if (seenCalIds.has(first.calId)) return false;
            seenCalIds.add(first.calId);
            return true;
        })
        .slice(0, 4)
        .map((k) => ({ key: k, ...events[k][0], extra: events[k].length - 1 }));

    return (
        <PanelCard
            title="School Calendar"
            subtitle={monthLabel}
            action={
                <Box>
                    <IconButton size="small" onClick={() => setView(new Date(year, month - 1, 1))}>
                        <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                        size="small"
                        onClick={() => {
                            setView(new Date(today.getFullYear(), today.getMonth(), 1));
                            setSelected(todayKey);
                        }}
                        sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#2563EB", px: 1 }}
                    >
                        Today
                    </IconButton>
                    <IconButton size="small" onClick={() => setView(new Date(year, month + 1, 1))}>
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                </Box>
            }
        >

            {/* Month grid */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    rowGap: 0.25,
                    textAlign: "center"
                }}
            >
                {weekDays.map((w, i) => (
                    <Typography
                        key={i}
                        sx={{ color: "#94A3B8", fontSize: "0.72rem", fontWeight: 600, pb: 0.5 }}
                    >
                        {w}
                    </Typography>
                ))}

                {cells.map((d, i) => {

                    if (!d) return <Box key={i} />;

                    const key = dateKey(year, month, d);
                    const dayEvents = events[key] || [];
                    const isToday = key === todayKey;
                    const isSelected = key === selected;

                    const info = dayInfo(key, monthCal);
                    const isHoliday = info.off && info.reason === "Holiday";
                    const isOffDay = info.off && !isHoliday;

                    const hasExam = dayEvents.some((e) => e.type === "exam");
                    const hasAnnouncement = dayEvents.some((e) => e.type === "announcement");

                    return (
                        <Box
                            key={i}
                            onClick={() => setSelected(key)}
                            sx={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                cursor: "pointer",
                                py: 0.25
                            }}
                        >
                            <Box
                                sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.82rem",
                                    fontWeight: isToday || isSelected ? 700 : 500,
                                    color: isToday ? "#FFFFFF" : isHoliday ? HOLIDAY_COLOR : isOffDay ? "#94A3B8" : "#334155",
                                    bgcolor: isToday ? "#2563EB" : isHoliday ? "#EDE9FE" : "transparent",
                                    border: isSelected && !isToday ? "2px solid #2563EB" : "2px solid transparent",
                                    "&:hover": { bgcolor: isToday ? "#2563EB" : "#F1F5F9" }
                                }}
                            >
                                {d}
                            </Box>

                            <Box sx={{ display: "flex", gap: "3px", height: 6, mt: "2px" }}>
                                {hasExam && (
                                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: EXAM_COLOR }} />
                                )}
                                {hasAnnouncement && (
                                    <Box sx={{ width: 5, height: 5, borderRadius: "50%", bgcolor: ANNOUNCEMENT_COLOR }} />
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* Legend */}
            <Box sx={{ display: "flex", gap: 2, mt: 1, mb: 1.5, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: EXAM_COLOR }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "#64748B" }}>Exam</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: ANNOUNCEMENT_COLOR }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "#64748B" }}>Announcement</Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: HOLIDAY_COLOR }} />
                    <Typography sx={{ fontSize: "0.72rem", color: "#64748B" }}>Holiday</Typography>
                </Box>
            </Box>

            {/* Selected day */}
            <Box
                sx={{
                    borderTop: "1px solid #F1F5F9",
                    pt: 1.5
                }}
            >
                <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", mb: 0.75 }}>
                    {selected === todayKey ? "Today" : prettyDate(selected)}
                </Typography>

                {selectedEvents.length === 0 ? (
                    <Typography sx={{ color: "#94A3B8", fontSize: "0.82rem" }}>
                        Nothing scheduled.
                    </Typography>
                ) : (
                    selectedEvents.map((e, i) => (
                        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
                            <Box
                                sx={{
                                    width: 8,
                                    height: 8,
                                    minWidth: 8,
                                    borderRadius: "50%",
                                    bgcolor: TYPE_COLOR[e.type] || "#94A3B8"
                                }}
                            />
                            <Typography sx={{ fontSize: "0.85rem", fontWeight: 600, flex: 1, minWidth: 0 }} noWrap>
                                {e.title}
                            </Typography>
                            <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", whiteSpace: "nowrap" }}>
                                {e.note}
                            </Typography>
                        </Box>
                    ))
                )}
            </Box>

            {/* Coming up */}
            {upcoming.length > 0 && (
                <Box sx={{ borderTop: "1px solid #F1F5F9", pt: 1.5, mt: 1.5 }}>
                    <Typography
                        sx={{
                            color: "#64748B",
                            fontSize: "0.72rem",
                            fontWeight: 700,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                            mb: 0.75
                        }}
                    >
                        Coming up
                    </Typography>

                    {upcoming.map((u) => (
                        <Box
                            key={u.key}
                            onClick={() => {
                                setSelected(u.key);
                                setView(new Date(`${u.key}T00:00:00`.slice(0, 8) + "01T00:00:00"));
                            }}
                            sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5, cursor: "pointer" }}
                        >
                            <EventAvailableIcon
                                sx={{ fontSize: 18, color: TYPE_COLOR[u.type] || ANNOUNCEMENT_COLOR }}
                            />
                            <Typography sx={{ fontSize: "0.82rem", flex: 1, minWidth: 0 }} noWrap>
                                {u.title}{u.extra > 0 ? ` +${u.extra} more` : ""}
                            </Typography>
                            <Typography sx={{ fontSize: "0.74rem", color: "#64748B", whiteSpace: "nowrap" }}>
                                {prettyDate(u.key)}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            )}

        </PanelCard>
    );
}

export default CalendarCard;
