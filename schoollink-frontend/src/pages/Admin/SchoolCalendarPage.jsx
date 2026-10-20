import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    IconButton,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CloseIcon from "@mui/icons-material/Close";
import EventIcon from "@mui/icons-material/EventOutlined";

import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import StatChips from "../../components/common/StatChips";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { notify } from "../../utils/notify";

import {
    getCalendar,
    updateWeeklyOff,
    createCalendarDay,
    updateCalendarDay,
    deleteCalendarDay
} from "../../services/calendarService";

import { prettyDate } from "../../utils/calendarUtils";

const DAYS = [
    { n: 0, label: "Sun" },
    { n: 1, label: "Mon" },
    { n: 2, label: "Tue" },
    { n: 3, label: "Wed" },
    { n: 4, label: "Thu" },
    { n: 5, label: "Fri" },
    { n: 6, label: "Sat" }
];

const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const KIND_STYLE = {
    "Holiday": { bg: "#FCE7F3", fg: "#BE185D" },
    "Working Day": { bg: "#DCFCE7", fg: "#15803D" }
};

const emptyForm = { id: null, kind: "Holiday", name: "", start_date: "", end_date: "" };

const d10 = (v) => String(v || "").slice(0, 10);

function iso(y, m, d) {
    return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

function sameList(a, b) {
    return a.length === b.length && a.every((x, i) => x === b[i]);
}

function SchoolCalendarPage() {

    const navigate = useNavigate();

    const now = new Date();
    const todayIso = iso(now.getFullYear(), now.getMonth(), now.getDate());

    const [year, setYear] = useState(now.getFullYear());
    const [month, setMonth] = useState(now.getMonth());

    const [weeklyOff, setWeeklyOff] = useState([0, 6]);
    const [savedOff, setSavedOff] = useState([0, 6]);
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [savingWeekly, setSavingWeekly] = useState(false);

    const [filter, setFilter] = useState("all");

    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [confirmDay, setConfirmDay] = useState(null);
    const [ask, setAsk] = useState(null);
    function runAsk() {
        const a = ask;
        setAsk(null);
        if (a?.run) a.run();
    }


    useEffect(() => {
        load();
    }, [year]);

    async function load() {
        try {
            setLoading(true);
            setError("");
            const response = await getCalendar(`${year}-01-01`, `${year}-12-31`);
            if (response.success) {
                const off = [...response.data.weekly_off_days].sort();
                setWeeklyOff(off);
                setSavedOff(off);
                setDays(response.data.days);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load the calendar.");
        } finally {
            setLoading(false);
        }
    }

    function toggleDay(n) {
        setMessage("");
        setWeeklyOff((list) =>
            list.includes(n) ? list.filter((d) => d !== n) : [...list, n].sort()
        );
    }

    function askWeekly() {
        setAsk({ title: "Save weekly off days?", message: "The weekly off days for the whole school will be updated.", confirmLabel: "Yes, save", run: saveWeekly });
    }

    function askDay() {
        if (!form || !form.id) { saveDay(); return; }
        setAsk({ title: "Save changes?", message: "This calendar entry will be updated.", confirmLabel: "Yes, save", run: saveDay });
    }

    async function saveWeekly() {
        try {
            setSavingWeekly(true);
            setError("");
            setMessage("");
            const response = await updateWeeklyOff(weeklyOff);
            if (response.success) {
                setSavedOff([...weeklyOff]);
                setMessage("Weekly off days saved.");
                notify("Weekly off days saved.");
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to save weekly off days.");
        } finally {
            setSavingWeekly(false);
        }
    }

    async function saveDay() {
        if (!form.name.trim() || !form.start_date) {
            setFormError("Please enter a name and a start date.");
            return;
        }

        try {
            setSaving(true);
            setFormError("");

            const payload = {
                kind: form.kind,
                name: form.name.trim(),
                start_date: form.start_date,
                end_date: form.end_date || form.start_date
            };

            const response = form.id
                ? await updateCalendarDay(form.id, payload)
                : await createCalendarDay(payload);

            if (response.success) {
                setForm(null);
                setMessage(form.id ? "Entry updated." : "Entry added.");
                notify(form.id ? "Entry updated." : "Entry added.");
                await load();
            } else {
                setFormError(response.message);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || "Unable to save this entry.");
        } finally {
            setSaving(false);
        }
    }

    async function removeDay() {
        const d = confirmDay;
        setConfirmDay(null);
        if (!d) return;
        try {
            const response = await deleteCalendarDay(d.id);
            if (response.success) {
                setMessage("Entry removed.");
                notify("Entry removed.");
                await load();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to remove this entry.");
        }
    }

    function openEdit(d) {
        const single = d10(d.start_date) === d10(d.end_date);
        setForm({ id: d.id, kind: d.kind, name: d.name, start_date: d10(d.start_date), end_date: single ? "" : d10(d.end_date) });
        setFormError("");
    }

    function openAdd(date) {
        setForm({ ...emptyForm, start_date: date || "" });
        setFormError("");
    }

    function changeMonth(delta) {
        let m = month + delta;
        let y = year;
        if (m < 0) { m = 11; y -= 1; }
        if (m > 11) { m = 0; y += 1; }
        setMonth(m);
        if (y !== year) setYear(y);
    }

    // entry covering a date (holiday wins over working day)
    function entryOn(date) {
        const hit = days.filter((d) => d10(d.start_date) <= date && date <= d10(d.end_date));
        return hit.find((d) => d.kind === "Holiday") || hit[0] || null;
    }

    const cells = useMemo(() => {
        const first = new Date(year, month, 1).getDay();
        const count = new Date(year, month + 1, 0).getDate();
        const out = [];
        for (let i = 0; i < first; i++) out.push(null);
        for (let d = 1; d <= count; d++) {
            const date = iso(year, month, d);
            const weekday = new Date(year, month, d).getDay();
            const entry = entryOn(date);
            let status = "school";
            if (entry && entry.kind === "Holiday") status = "holiday";
            else if (entry && entry.kind === "Working Day") status = "working";
            else if (weeklyOff.includes(weekday)) status = "off";
            out.push({ d, date, status, entry });
        }
        return out;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [year, month, days, weeklyOff]);

    const holidays = days.filter((d) => d.kind === "Holiday");
    const workingDays = days.filter((d) => d.kind === "Working Day");
    const next = [...days]
        .filter((d) => d10(d.end_date) >= todayIso && d.kind === "Holiday")
        .sort((a, b) => d10(a.start_date).localeCompare(d10(b.start_date)))[0];

    const stats = [
        { label: `Holidays in ${year}`, value: holidays.length, filter: "Holiday", tone: "#BE185D" },
        { label: "Make-up working days", value: workingDays.length, filter: "Working Day", tone: "#15803D" },
        { label: "Weekly off days", value: weeklyOff.length },
        { label: "Next holiday", value: next ? prettyDate(d10(next.start_date), { day: "numeric", month: "short" }) : "-" }
    ];

    const listed = days
        .filter((d) => filter === "all" || d.kind === filter)
        .sort((a, b) => d10(a.start_date).localeCompare(d10(b.start_date)));

    const dirty = !sameList(weeklyOff, savedOff);

    const CELL = {
        school: { bg: "#fff", fg: "inherit", bd: "var(--sl-border, #E2E8F0)" },
        off: { bg: "#E2E8F0", fg: "#64748B", bd: "#E2E8F0" },
        holiday: { bg: "#FCE7F3", fg: "#BE185D", bd: "#F9A8D4" },
        working: { bg: "#DCFCE7", fg: "#15803D", bd: "#86EFAC" }
    };

    return (

        <Box sx={{ maxWidth: 1000 }}>

            <Box
                onClick={() => navigate("/dashboard")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", cursor: "pointer", mb: 1.5, width: "fit-content" }}
            >
                <ArrowBackIcon fontSize="small" />
                <Typography sx={{ fontSize: "0.9rem" }}>Back to Dashboard</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
                <Box sx={{ width: 46, height: 46, minWidth: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <EventIcon sx={{ color: "var(--sl-ink, #4F46E5)" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>School Calendar</Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                        Days school is closed. Teachers can't mark attendance on those days, and parents see "Weekend" or "Holiday".
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => openAdd("")}>
                    Add holiday
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

            <StatChips items={stats} active={filter} onPick={(f) => setFilter((cur) => (cur === f ? "all" : f))} />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "start", mb: 2 }}>

                {/* ---------- month grid ---------- */}
                <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 3 }}>

                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                        <IconButton size="small" aria-label="Previous month" onClick={() => changeMonth(-1)}><ChevronLeftIcon /></IconButton>
                        <Typography sx={{ flex: 1, textAlign: "center", fontWeight: 800 }}>
                            {MONTH_NAMES[month]} {year}
                        </Typography>
                        <IconButton size="small" aria-label="Next month" onClick={() => changeMonth(1)}><ChevronRightIcon /></IconButton>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.5 }}>
                        {DAYS.map((d) => (
                            <Typography key={d.n} sx={{ textAlign: "center", fontSize: "0.7rem", fontWeight: 800, color: "text.secondary" }}>
                                {d.label}
                            </Typography>
                        ))}
                        {cells.map((c, i) => c === null ? <Box key={`e${i}`} /> : (
                            <Box
                                key={c.date}
                                data-testid="cal-cell"
                                data-status={c.status}
                                title={c.entry ? c.entry.name : ""}
                                onClick={() => (c.entry ? openEdit(c.entry) : openAdd(c.date))}
                                sx={{
                                    aspectRatio: "1",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    borderRadius: 2,
                                    cursor: "pointer",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    bgcolor: CELL[c.status].bg,
                                    color: CELL[c.status].fg,
                                    border: "1px solid",
                                    borderColor: CELL[c.status].bd,
                                    outline: c.date === todayIso ? "2px solid var(--sl-ink, #111827)" : "none",
                                    outlineOffset: 1,
                                    "&:hover": { filter: "brightness(0.96)" }
                                }}
                            >
                                {c.d}
                            </Box>
                        ))}
                    </Box>

                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1.5, fontSize: "0.74rem", color: "text.secondary" }}>
                        {[["#fff", "var(--sl-border, #E2E8F0)", "School day"], ["#E2E8F0", "#E2E8F0", "Weekly off"], ["#FCE7F3", "#F9A8D4", "Holiday"], ["#DCFCE7", "#86EFAC", "Working day"]].map(([bg, bd, label]) => (
                            <Box key={label} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Box sx={{ width: 12, height: 12, borderRadius: 0.75, bgcolor: bg, border: "1px solid", borderColor: bd }} />
                                {label}
                            </Box>
                        ))}
                    </Box>

                    <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", mt: 0.75 }}>
                        Tap a date to add a holiday, or tap a coloured date to edit it.
                    </Typography>

                </Card>

                {/* ---------- weekly off ---------- */}
                <Card sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 800, mb: 0.25 }}>Weekly off days</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.84rem", mb: 1.5 }}>
                        Tap the days the school is closed every week.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2 }}>
                        {DAYS.map((d) => {
                            const off = weeklyOff.includes(d.n);
                            return (
                                <Chip
                                    key={d.n}
                                    label={d.label}
                                    clickable
                                    onClick={() => toggleDay(d.n)}
                                    sx={{
                                        fontWeight: 800,
                                        minWidth: 54,
                                        height: 38,
                                        border: "1px solid",
                                        borderColor: off ? "var(--sl-ink, #111827)" : "var(--sl-border, #E2E8F0)",
                                        bgcolor: off ? "var(--sl-accent, #FFC400)" : "#fff",
                                        color: off ? "var(--sl-ink, #111827)" : "text.secondary",
                                        "&:hover": { bgcolor: off ? "var(--sl-accent, #FFC400)" : "var(--sl-soft, #F1F5F9)" }
                                    }}
                                />
                            );
                        })}
                    </Box>
                    {weeklyOff.length >= 7 && (
                        <Alert severity="warning" sx={{ mb: 1.5 }}>School can't be closed all 7 days.</Alert>
                    )}
                    <Button
                        variant="contained"
                        onClick={askWeekly}
                        disabled={savingWeekly || weeklyOff.length >= 7 || !dirty}
                    >
                        {savingWeekly ? "Saving..." : "Save weekly off days"}
                    </Button>
                </Card>

            </Box>

            {/* ---------- list ---------- */}
            <Card sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1, flexWrap: "wrap" }}>
                    <Typography sx={{ fontWeight: 800, flex: 1 }}>
                        Holidays and special days
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <IconButton size="small" aria-label="Previous year" onClick={() => setYear((y) => y - 1)}><ChevronLeftIcon /></IconButton>
                        <Typography sx={{ fontWeight: 800, minWidth: 48, textAlign: "center" }}>{year}</Typography>
                        <IconButton size="small" aria-label="Next year" onClick={() => setYear((y) => y + 1)}><ChevronRightIcon /></IconButton>
                    </Box>
                </Box>

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                        <CircularProgress size={26} />
                    </Box>
                )}

                {!loading && listed.length === 0 && (
                    <Typography sx={{ color: "text.secondary", py: 2 }}>
                        {days.length === 0 ? `Nothing added for ${year} yet. Tap "Add holiday" or a date on the calendar.` : "No entries in this view."}
                    </Typography>
                )}

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

                    {!loading && listed.map((d) => {
                        const style = KIND_STYLE[d.kind] || KIND_STYLE.Holiday;
                        const single = d10(d.start_date) === d10(d.end_date);
                        const past = d10(d.end_date) < todayIso;
                        return (
                            <Box
                                key={d.id}
                                data-testid="cal-entry"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    p: 1.25,
                                    borderRadius: 3,
                                    border: "1px solid var(--sl-border, #E2E8F0)",
                                    bgcolor: "#fff",
                                    opacity: past ? 0.65 : 1,
                                    flexWrap: "wrap"
                                }}
                            >
                                <Box sx={{ width: 52, minWidth: 52, borderRadius: 2, bgcolor: style.bg, color: style.fg, textAlign: "center", py: 0.75 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1 }}>
                                        {d10(d.start_date).slice(8, 10).replace(/^0/, "")}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>
                                        {prettyDate(d10(d.start_date), { month: "short" })}
                                    </Typography>
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 150 }}>
                                    <Typography sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>{d.name}</Typography>
                                    <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                                        {single
                                            ? prettyDate(d10(d.start_date), { weekday: "long", day: "numeric", month: "short", year: "numeric" })
                                            : `${prettyDate(d10(d.start_date))} to ${prettyDate(d10(d.end_date), { weekday: "short", day: "numeric", month: "short", year: "numeric" })}`}
                                        {past ? " · past" : ""}
                                    </Typography>
                                </Box>

                                <Chip size="small" label={d.kind} sx={{ bgcolor: style.bg, color: style.fg, fontWeight: 700 }} />

                                <Box sx={{ display: "flex" }}>
                                    <IconButton size="small" aria-label={`Edit ${d.name}`} onClick={() => openEdit(d)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" aria-label={`Delete ${d.name}`} onClick={() => setConfirmDay(d)}>
                                        <DeleteIcon fontSize="small" sx={{ color: "#DC2626" }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        );
                    })}

                </Box>

            </Card>

            {/* ---------------- add / edit dialog ---------------- */}
            <Dialog open={!!form} onClose={() => setForm(null)} fullWidth maxWidth="xs">
                {form && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 2.5 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.1rem" }}>
                                {form.id ? "Edit entry" : "Add to calendar"}
                            </Typography>
                            <IconButton size="small" onClick={() => setForm(null)}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>
                        <DialogContent>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>
                                {formError && <Alert severity="error">{formError}</Alert>}
                                <TextField
                                    select
                                    label="Type"
                                    value={form.kind}
                                    onChange={(e) => setForm({ ...form, kind: e.target.value })}
                                    helperText={
                                        form.kind === "Holiday"
                                            ? "School is closed. No attendance."
                                            : "School is open on a day that is normally off, e.g. a make-up Saturday."
                                    }
                                    fullWidth
                                >
                                    <MenuItem value="Holiday">Holiday (school closed)</MenuItem>
                                    <MenuItem value="Working Day">Working day (school open)</MenuItem>
                                </TextField>
                                <TextField
                                    label="Name"
                                    placeholder="e.g. Deepavali, Sports Day, Make-up Saturday"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    fullWidth
                                />
                                <SchoolDatePicker
                                    key={`s-${form.start_date}`}
                                    label="Start date"
                                    value={form.start_date}
                                    onChange={(v) => setForm((f) => ({ ...f, start_date: v }))}
                                    fullWidth
                                />
                                <SchoolDatePicker
                                    label="End date (leave empty for one day)"
                                    value={form.end_date}
                                    onChange={(v) => setForm((f) => ({ ...f, end_date: v }))}
                                    minDate={form.start_date ? new Date(`${form.start_date}T00:00:00`) : undefined}
                                    fullWidth
                                />
                            </Box>
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2.5 }}>
                            <Button onClick={() => setForm(null)}>Cancel</Button>
                            <Button variant="contained" onClick={askDay} disabled={saving}>
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </DialogActions>
                    </>
                )}
            </Dialog>

            <ConfirmDialog
                open={!!ask}
                title={ask?.title || ""}
                message={ask?.message || ""}
                confirmLabel={ask?.confirmLabel || "Proceed"}
                confirmColor={ask?.confirmColor || "primary"}
                onConfirm={runAsk}
                onCancel={() => setAsk(null)}
            />

            <ConfirmDialog
                open={Boolean(confirmDay)}
                title="Remove this entry?"
                message={confirmDay ? `"${confirmDay.name}" will be removed from the calendar.` : ""}
                confirmLabel="Remove"
                confirmColor="error"
                onConfirm={removeDay}
                onCancel={() => setConfirmDay(null)}
            />

        </Box>

    );

}

export default SchoolCalendarPage;
