import { useEffect, useState } from "react";
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

import SchoolDatePicker from "../../components/common/SchoolDatePicker";
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

const KIND_STYLE = {
    "Holiday": { bg: "#EDE9FE", fg: "#6D28D9" },
    "Working Day": { bg: "#DCFCE7", fg: "#15803D" }
};

const emptyForm = { id: null, kind: "Holiday", name: "", start_date: "", end_date: "" };

function SchoolCalendarPage() {

    const navigate = useNavigate();

    const [year, setYear] = useState(new Date().getFullYear());
    const [weeklyOff, setWeeklyOff] = useState([0, 6]);
    const [days, setDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [savingWeekly, setSavingWeekly] = useState(false);

    const [form, setForm] = useState(null);
    const [saving, setSaving] = useState(false);
    const [formError, setFormError] = useState("");

    const [confirmId, setConfirmId] = useState(null);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        load();
    }, [year]);

    async function load() {
        try {
            setLoading(true);
            setError("");
            const response = await getCalendar(`${year}-01-01`, `${year}-12-31`);
            if (response.success) {
                setWeeklyOff(response.data.weekly_off_days);
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

    async function saveWeekly() {
        try {
            setSavingWeekly(true);
            setError("");
            setMessage("");
            const response = await updateWeeklyOff(weeklyOff);
            if (response.success) {
                setMessage("Weekly off days saved.");
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

    async function removeDay(id) {
        try {
            setDeleting(true);
            const response = await deleteCalendarDay(id);
            if (response.success) {
                setConfirmId(null);
                setMessage("Entry removed.");
                await load();
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to remove this entry.");
        } finally {
            setDeleting(false);
        }
    }

    return (

        <Box sx={{ maxWidth: 820 }}>

            <Box
                onClick={() => navigate("/dashboard")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", cursor: "pointer", mb: 2, width: "fit-content" }}
            >
                <ArrowBackIcon fontSize="small" />
                <Typography sx={{ fontSize: "0.9rem" }}>Back to Dashboard</Typography>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                School Calendar
            </Typography>

            <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 3 }}>
                Set which days school is closed. Teachers can't mark attendance on those days, and parents see "Weekend" or "Holiday" instead of "Not marked".
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage("")}>{message}</Alert>}

            {/* ---------------- weekly off ---------------- */}
            <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}>

                <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Weekly off days</Typography>

                <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 2 }}>
                    Tap the days the school is closed every week.
                </Typography>

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    {DAYS.map((d) => {
                        const off = weeklyOff.includes(d.n);
                        return (
                            <Chip
                                key={d.n}
                                label={d.label}
                                clickable
                                onClick={() => toggleDay(d.n)}
                                sx={{
                                    fontWeight: 700,
                                    minWidth: 56,
                                    height: 38,
                                    bgcolor: off ? "#6D28D9" : "#F1F5F9",
                                    color: off ? "white" : "#475569",
                                    "&:hover": { bgcolor: off ? "#5B21B6" : "#E2E8F0" }
                                }}
                            />
                        );
                    })}
                </Box>

                <Button
                    variant="contained"
                    onClick={saveWeekly}
                    loading={savingWeekly}
                    loadingPosition="start"
                    disabled={savingWeekly || weeklyOff.length >= 7}
                >
                    {savingWeekly ? "Saving..." : "Save weekly off days"}
                </Button>

            </Card>

            {/* ---------------- holidays ---------------- */}
            <Card sx={{ p: { xs: 2, sm: 3 } }}>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 2 }}>

                    <Box>
                        <Typography sx={{ fontWeight: 700 }}>Holidays and special days</Typography>
                        <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                            Add festivals, closures and make-up working days.
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => { setForm({ ...emptyForm }); setFormError(""); }}
                    >
                        Add
                    </Button>

                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
                    <IconButton size="small" onClick={() => setYear((y) => y - 1)}>
                        <ChevronLeftIcon />
                    </IconButton>
                    <Typography sx={{ fontWeight: 700, minWidth: 56, textAlign: "center" }}>{year}</Typography>
                    <IconButton size="small" onClick={() => setYear((y) => y + 1)}>
                        <ChevronRightIcon />
                    </IconButton>
                </Box>

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                        <CircularProgress size={26} />
                    </Box>
                )}

                {!loading && days.length === 0 && (
                    <Typography sx={{ color: "#94A3B8", py: 2 }}>
                        Nothing added for {year} yet.
                    </Typography>
                )}

                {!loading && days.map((d) => {

                    const style = KIND_STYLE[d.kind] || KIND_STYLE.Holiday;
                    const single = d.start_date === d.end_date;

                    return (

                        <Box
                            key={d.id}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5,
                                py: 1.5,
                                borderTop: "1px solid #F1F5F9",
                                flexWrap: "wrap"
                            }}
                        >

                            <Box
                                sx={{
                                    width: 52,
                                    minWidth: 52,
                                    borderRadius: 2,
                                    bgcolor: style.bg,
                                    color: style.fg,
                                    textAlign: "center",
                                    py: 0.75
                                }}
                            >
                                <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1 }}>
                                    {d.start_date.slice(8, 10).replace(/^0/, "")}
                                </Typography>
                                <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, textTransform: "uppercase" }}>
                                    {prettyDate(d.start_date, { month: "short" })}
                                </Typography>
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 160 }}>
                                <Typography sx={{ fontWeight: 600, overflowWrap: "anywhere" }}>{d.name}</Typography>
                                <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
                                    {single
                                        ? prettyDate(d.start_date, { weekday: "long", day: "numeric", month: "short", year: "numeric" })
                                        : `${prettyDate(d.start_date)} to ${prettyDate(d.end_date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}`}
                                </Typography>
                            </Box>

                            <Chip size="small" label={d.kind} sx={{ bgcolor: style.bg, color: style.fg, fontWeight: 700 }} />

                            {confirmId === d.id ? (
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                    <Button size="small" onClick={() => setConfirmId(null)}>Keep</Button>
                                    <Button
                                        size="small"
                                        color="error"
                                        variant="contained"
                                        loading={deleting}
                                        loadingPosition="start"
                                        disabled={deleting}
                                        onClick={() => removeDay(d.id)}
                                    >
                                        {deleting ? "Removing..." : "Remove"}
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ display: "flex" }}>
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => {
                                            setForm({ id: d.id, kind: d.kind, name: d.name, start_date: d.start_date, end_date: single ? "" : d.end_date });
                                            setFormError("");
                                        }}
                                    >
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" color="error" onClick={() => setConfirmId(d.id)}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            )}

                        </Box>

                    );

                })}

            </Card>

            {/* ---------------- add / edit dialog ---------------- */}
            <Dialog open={!!form} onClose={() => setForm(null)} fullWidth maxWidth="xs">

                {form && (
                    <>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 2.5 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
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
                                    label="Start date"
                                    value={form.start_date}
                                    onChange={(v) => setForm({ ...form, start_date: v })}
                                    fullWidth
                                />

                                <SchoolDatePicker
                                    label="End date (leave empty for one day)"
                                    value={form.end_date}
                                    onChange={(v) => setForm({ ...form, end_date: v })}
                                    minDate={form.start_date ? new Date(`${form.start_date}T00:00:00`) : undefined}
                                    fullWidth
                                />

                            </Box>

                        </DialogContent>

                        <DialogActions sx={{ px: 3, pb: 2.5 }}>
                            <Button onClick={() => setForm(null)}>Cancel</Button>
                            <Button
                                variant="contained"
                                onClick={saveDay}
                                loading={saving}
                                loadingPosition="start"
                                disabled={saving}
                            >
                                {saving ? "Saving..." : "Save"}
                            </Button>
                        </DialogActions>
                    </>
                )}

            </Dialog>

        </Box>

    );

}

export default SchoolCalendarPage;
