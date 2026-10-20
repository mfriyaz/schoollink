import { useEffect, useMemo, useState } from "react";

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
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";

import EventRepeatIcon from "@mui/icons-material/EventRepeatOutlined";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMoreRounded";

import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import StatChips from "../../components/common/StatChips";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { notify } from "../../utils/notify";
import { getStudents } from "../../services/studentService";
import { getAllClassesForManagement, getAllSectionsForClass } from "../../services/classManagementService";
import { getMyYears, startNewYear } from "../../services/academicYearService";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function day(v) {
    return v ? String(v).slice(0, 10) : "";
}

function fmt(v) {
    const d = day(v);
    if (!d) return "";
    const [y, m, dd] = d.split("-");
    return `${Number(dd)} ${MONTHS[Number(m) - 1]} ${y}`;
}

function addYears(dateStr, n) {
    const d = day(dateStr);
    if (!d) return "";
    const [y, m, dd] = d.split("-");
    return `${Number(y) + n}-${m}-${dd}`;
}

// "2026-2027" -> "2027-2028"
function nextYearName(name) {
    const m = String(name || "").match(/^(\d{4})\s*-\s*(\d{2,4})$/);
    if (!m) return "";
    const a = Number(m[1]) + 1;
    const b = Number(m[2]) + 1;
    return `${a}-${m[2].length === 2 ? String(b).padStart(2, "0") : b}`;
}

const pillSx = (active) => ({
    px: 1.5, py: 0.55, borderRadius: 99, cursor: "pointer", fontSize: "0.82rem", fontWeight: 700,
    color: "var(--sl-ink)", border: "1.5px solid var(--sl-ink)",
    bgcolor: active ? "var(--sl-accent)" : "transparent"
});

const cardSx = { borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" };

function AcademicYearPage() {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [years, setYears] = useState([]);
    const [classes, setClasses] = useState([]);
    const [sectionsByClass, setSectionsByClass] = useState({});
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    // wizard
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const [yearName, setYearName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [plan, setPlan] = useState({});
    const [expanded, setExpanded] = useState({});
    const [error, setError] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        load();
    }, []);

    async function load() {
        try {
            setLoading(true);
            const [y, c, s] = await Promise.all([getMyYears(), getAllClassesForManagement(), getStudents()]);
            if (y.success) setYears(y.data);
            if (s.success) setStudents(s.data.filter((x) => x.is_active !== false));
            if (c.success) {
                const active = c.data.filter((x) => x.is_active !== false)
                    .sort((a, b) => (Number(a.class_order) - Number(b.class_order)) || String(a.class_name).localeCompare(String(b.class_name)));
                setClasses(active);
                const entries = await Promise.all(active.map(async (cl) => {
                    try {
                        const r = await getAllSectionsForClass(cl.id);
                        return [cl.id, r.success ? r.data.filter((x) => x.is_active !== false) : []];
                    } catch (err) {
                        return [cl.id, []];
                    }
                }));
                setSectionsByClass(Object.fromEntries(entries));
            }
        } catch (err) {
            setPageError(err.response?.data?.message || "Unable to load the academic year.");
        } finally {
            setLoading(false);
        }
    }

    const current = years.find((y) => y.is_current) || years[0];

    const nextClassOf = (cls) => {
        const i = classes.findIndex((c) => c.id === cls.id);
        return i >= 0 && i < classes.length - 1 ? classes[i + 1] : null;
    };

    // the section a promoted student lands in: same name, else the first one
    const destSection = (student, nextClass) => {
        const list = sectionsByClass[nextClass.id] || [];
        const same = list.find((s) => String(s.section_name).toLowerCase() === String(student.section_name || "").toLowerCase());
        return same || list[0] || null;
    };

    const classById = useMemo(() => Object.fromEntries(classes.map((c) => [c.id, c])), [classes]);

    function defaultFor(student) {
        const cls = classById[student.class_id];
        const next = cls ? nextClassOf(cls) : null;
        if (!next) return { action: cls ? "leave" : "stay" };
        const sec = destSection(student, next);
        return sec ? { action: "promote", to_class_id: next.id, to_section_id: sec.id } : { action: "stay" };
    }

    function openWizard() {
        setError("");
        setStep(1);
        const suggested = nextYearName(current?.year_name);
        setYearName(suggested);
        setStartDate(current ? addYears(current.start_date, 1) : "");
        setEndDate(current ? addYears(current.end_date, 1) : "");
        const p = {};
        students.forEach((s) => { p[s.id] = defaultFor(s); });
        setPlan(p);
        setExpanded({});
        setOpen(true);
    }

    function setStudentAction(student, action) {
        setPlan((prev) => {
            if (action === "promote") {
                const cls = classById[student.class_id];
                const next = cls ? nextClassOf(cls) : null;
                const sec = next ? destSection(student, next) : null;
                if (!next || !sec) return prev;
                return { ...prev, [student.id]: { action, to_class_id: next.id, to_section_id: sec.id } };
            }
            return { ...prev, [student.id]: { action } };
        });
    }

    function setClassAction(cls, action) {
        students.filter((s) => s.class_id === cls.id).forEach((s) => setStudentAction(s, action));
    }

    function goStep2() {
        setError("");
        if (!yearName.trim()) { setError("Enter the new year's name, for example 2027-2028."); return; }
        if (!startDate || !endDate) { setError("Choose the start and end dates."); return; }
        if (endDate <= startDate) { setError("The end date must be after the start date."); return; }
        if (years.some((y) => String(y.year_name).toLowerCase() === yearName.trim().toLowerCase())) {
            setError("A year with this name already exists.");
            return;
        }
        setStep(2);
    }

    const counts = useMemo(() => {
        const c = { promote: 0, stay: 0, leave: 0 };
        students.forEach((s) => { c[(plan[s.id] || { action: "stay" }).action] += 1; });
        return c;
    }, [plan, students]);

    async function submit() {
        try {
            setSaving(true);
            setError("");
            const moves = students.map((s) => ({ student_id: s.id, ...(plan[s.id] || { action: "stay" }) }));
            const r = await startNewYear({ year_name: yearName.trim(), start_date: startDate, end_date: endDate, moves });
            if (r.success) {
                notify(`${r.data.year.year_name} started. ${r.data.promoted} promoted, ${r.data.stayed} stayed, ${r.data.left} left.`);
                setOpen(false);
                await load();
            } else {
                setError(r.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to start the new year.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const classesWithStudents = classes.filter((c) => students.some((s) => s.class_id === c.id));

    return (
        <Box sx={{ maxWidth: 900 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 46, height: 46, minWidth: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <EventRepeatIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>Academic Year</Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                        Start a new school year and move students up a class
                    </Typography>
                </Box>
            </Box>

            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

            {current && (
                <Card data-testid="current-year" sx={{ ...cardSx, p: { xs: 2, sm: 2.5 }, mb: 2 }}>
                    <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.5, color: "text.secondary" }}>CURRENT YEAR</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mt: 0.5 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", color: "var(--sl-ink)" }}>{current.year_name}</Typography>
                        <Chip size="small" color="success" label="Current" />
                        <Box sx={{ flex: 1 }} />
                        <Button variant="contained" onClick={openWizard} disabled={students.length === 0 && classes.length === 0}>
                            Start new year
                        </Button>
                    </Box>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.86rem", mt: 0.5 }}>
                        {fmt(current.start_date)} - {fmt(current.end_date)}
                    </Typography>
                    <Box sx={{ mt: 1.5 }}>
                        <StatChips items={[
                            { label: "Active students", value: students.length },
                            { label: "Classes", value: classes.length }
                        ]} />
                    </Box>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                        When the year ends, tap Start new year. You choose who moves up, who stays back and who has left.
                        Old marks, attendance and report cards stay safe under the old year.
                    </Typography>
                </Card>
            )}

            <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.5, color: "text.secondary", mb: 0.75 }}>ALL YEARS</Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                {years.map((y) => (
                    <Box key={y.id} data-testid="year-row" sx={{ display: "flex", alignItems: "center", gap: 1, p: 1.5, borderRadius: 2.5, bgcolor: "#fff", border: "1px solid var(--sl-border)" }}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700 }}>{y.year_name}</Typography>
                            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                                {fmt(y.start_date)} - {fmt(y.end_date)} · {y.students} student{y.students === 1 ? "" : "s"}
                            </Typography>
                        </Box>
                        {y.is_current && <Chip size="small" color="success" label="Current" />}
                    </Box>
                ))}
            </Box>

            {/* ---------- Start new year ---------- */}
            <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="md" fullScreen={fullScreen}>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: 2.5, pb: 1.5 }}>
                    <Box sx={{ width: 42, height: 42, minWidth: 42, borderRadius: "13px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <EventRepeatIcon sx={{ color: "var(--sl-ink)" }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--sl-ink)" }}>Start new year</Typography>
                        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                            Part {step} of 2 · {step === 1 ? "Year name and dates" : "Who moves where"}
                        </Typography>
                    </Box>
                    <IconButton aria-label="Close" onClick={() => !saving && setOpen(false)} size="small"><CloseIcon fontSize="small" /></IconButton>
                </Box>

                <DialogContent sx={{ pt: 0.5 }}>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {step === 1 && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                            <TextField label="New year name" value={yearName} onChange={(e) => setYearName(e.target.value)} placeholder="e.g. 2027-2028" fullWidth autoFocus />
                            <SchoolDatePicker label="Start date" value={startDate} onChange={setStartDate} fullWidth />
                            <SchoolDatePicker label="End date" value={endDate} onChange={setEndDate} fullWidth />
                            <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                                Current teacher assignments continue into the new year. You can change any of them later with Transfer or End.
                            </Typography>
                        </Box>
                    )}

                    {step === 2 && (
                        <>
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                                <Chip label={`${counts.promote} move up`} sx={{ fontWeight: 700 }} />
                                <Chip label={`${counts.stay} stay`} sx={{ fontWeight: 700 }} />
                                <Chip label={`${counts.leave} left school`} sx={{ fontWeight: 700 }} />
                            </Box>

                            {classesWithStudents.length === 0 && (
                                <Alert severity="info">There are no active students to move. The new year will simply start.</Alert>
                            )}

                            {classesWithStudents.map((cls) => {
                                const list = students.filter((s) => s.class_id === cls.id)
                                    .sort((a, b) => String(a.first_name).localeCompare(String(b.first_name)));
                                const next = nextClassOf(cls);
                                const allSame = (a) => list.every((s) => (plan[s.id] || {}).action === a);
                                const isOpen = !!expanded[cls.id];
                                return (
                                    <Box key={cls.id} data-testid="promo-class" sx={{ mb: 1.5, p: 1.5, borderRadius: 3, border: "1px solid var(--sl-border)", bgcolor: "#fff" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                            <Box sx={{ flex: 1, minWidth: 140 }}>
                                                <Typography sx={{ fontWeight: 800 }}>{cls.class_name}</Typography>
                                                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                                                    {list.length} student{list.length === 1 ? "" : "s"}
                                                    {next ? ` · next class: ${next.class_name}` : " · last class"}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                                                {next && <Box role="button" tabIndex={0} onClick={() => setClassAction(cls, "promote")} sx={pillSx(allSame("promote"))}>Move all up</Box>}
                                                <Box role="button" tabIndex={0} onClick={() => setClassAction(cls, "stay")} sx={pillSx(allSame("stay"))}>All stay</Box>
                                                <Box role="button" tabIndex={0} onClick={() => setClassAction(cls, "leave")} sx={pillSx(allSame("leave"))}>All left</Box>
                                            </Box>
                                        </Box>

                                        <Box
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => setExpanded((p) => ({ ...p, [cls.id]: !p[cls.id] }))}
                                            sx={{ display: "inline-flex", alignItems: "center", gap: 0.25, mt: 1, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)" }}
                                        >
                                            {isOpen ? "Hide students" : "Review students"}
                                            <ExpandMoreIcon sx={{ fontSize: 18, transform: isOpen ? "rotate(180deg)" : "none" }} />
                                        </Box>

                                        {isOpen && (
                                            <Box sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
                                                {list.map((s) => {
                                                    const p = plan[s.id] || { action: "stay" };
                                                    const dest = p.action === "promote" ? `${classById[p.to_class_id]?.class_name || ""}${(sectionsByClass[p.to_class_id] || []).find((x) => x.id === p.to_section_id)?.section_name ? ` - ${(sectionsByClass[p.to_class_id] || []).find((x) => x.id === p.to_section_id).section_name}` : ""}` : "";
                                                    return (
                                                        <Box key={s.id} data-testid="promo-student" sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", py: 0.5, borderTop: "1px dashed var(--sl-border)" }}>
                                                            <Box sx={{ flex: 1, minWidth: 130 }}>
                                                                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{s.first_name} {s.last_name}</Typography>
                                                                <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                                                                    {s.class_name}{s.section_name ? ` - ${s.section_name}` : ""}{dest ? ` → ${dest}` : ""}
                                                                </Typography>
                                                            </Box>
                                                            <TextField select size="small" value={p.action} onChange={(e) => setStudentAction(s, e.target.value)} sx={{ minWidth: 150 }} slotProps={{ htmlInput: { "aria-label": `Action for ${s.first_name}` } }}>
                                                                <MenuItem value="promote" disabled={!next}>Move up</MenuItem>
                                                                <MenuItem value="stay">Stay in class</MenuItem>
                                                                <MenuItem value="leave">Left school</MenuItem>
                                                            </TextField>
                                                        </Box>
                                                    );
                                                })}
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </>
                    )}

                </DialogContent>

                <DialogActions sx={{ px: 2.5, pb: 2.5, gap: 1 }}>
                    {step === 1 ? (
                        <>
                            <Button onClick={() => setOpen(false)}>Cancel</Button>
                            <Button variant="contained" onClick={goStep2}>Next</Button>
                        </>
                    ) : (
                        <>
                            <Button onClick={() => setStep(1)} disabled={saving}>Back</Button>
                            <Button variant="contained" onClick={() => setConfirmOpen(true)} disabled={saving}>
                                {saving ? "Starting..." : "Start new year"}
                            </Button>
                        </>
                    )}
                </DialogActions>

            </Dialog>

            <ConfirmDialog
                open={confirmOpen}
                title={`Start ${yearName || "the new year"}?`}
                message={`${counts.promote} student${counts.promote === 1 ? "" : "s"} will move up, ${counts.stay} will stay in their class and ${counts.leave} will be marked as left school. ${current ? `${current.year_name} will be closed.` : ""} This is a big change and can't be undone with one click.`}
                confirmLabel="Yes, start new year"
                confirmColor="warning"
                onConfirm={() => { setConfirmOpen(false); submit(); }}
                onCancel={() => setConfirmOpen(false)}
            />

        </Box>
    );
}

export default AcademicYearPage;
