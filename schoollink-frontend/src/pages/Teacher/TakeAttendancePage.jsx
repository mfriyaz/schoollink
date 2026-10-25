import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    Typography
} from "@mui/material";
import StatChips from "../../components/common/StatChips";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";
import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import { getDayStatus } from "../../services/calendarService";
import { getAttendanceMode } from "../../services/settingsService";
import PageHeader from "../../components/common/PageHeader";
import { prettyDate } from "../../utils/calendarUtils";
import {
    getMyTeacherProfile,
    getMyAssignments,
    getAttendanceRoster,
    bulkMarkAttendance
} from "../../services/postService";
const statuses = [
    { value: "Present", icon: <CheckCircleIcon sx={{ fontSize: 18 }} />, color: "#16A34A" },
    { value: "Absent", icon: <CancelIcon sx={{ fontSize: 18 }} />, color: "#DC2626" },
    { value: "Late", icon: <AccessTimeIcon sx={{ fontSize: 18 }} />, color: "#D97706" }
];

const pillSx = (active, color) => ({
    px: 1.5,
    py: 0.6,
    borderRadius: 99,
    cursor: "pointer",
    userSelect: "none",
    fontSize: "0.84rem",
    fontWeight: 700,
    border: "1.5px solid var(--sl-ink)",
    bgcolor: active ? (color || "var(--sl-accent)") : "transparent",
    color: active ? (color ? "#fff" : "var(--sl-ink)") : "var(--sl-ink)",
    "&:hover": { bgcolor: active ? undefined : "var(--sl-soft)" }
});

function initialsOf(s) {
    return `${(s.first_name || "?")[0]}${(s.last_name || "")[0] || ""}`.toUpperCase();
}
function TakeAttendancePage() {
    const [assignments, setAssignments] = useState([]);
    const [mode, setMode] = useState("subject");
    const [session, setSession] = useState("Morning");
    const [teacherSubjectId, setTeacherSubjectId] = useState("");
    const [date, setDate] = useState(
        new Intl.DateTimeFormat("en-CA", { timeZone: getSchoolTimezone() }).format(new Date())
    );
    const [roster, setRoster] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [dayStatus, setDayStatus] = useState(null);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [filter, setFilter] = useState("all");
    const [dateKey, setDateKey] = useState(0);
    useEffect(() => {
        loadAssignments();
    }, []);
    useEffect(() => {
        let cancelled = false;
        setDayStatus(null);
        if (date) {
            getDayStatus(date)
                .then((r) => { if (!cancelled && r.success) setDayStatus(r.data); })
                .catch(() => {});
        }
        return () => { cancelled = true; };
    }, [date]);
    useEffect(() => {
        if (teacherSubjectId && date) {
            loadRoster();
        }
    }, [teacherSubjectId, date, session]);
    async function loadAssignments() {
        try {
            const profileResponse = await getMyTeacherProfile();
            if (!profileResponse.success) {
                setError(profileResponse.message);
                return;
            }
            let schoolMode = "subject";
            try {
                const modeResponse = await getAttendanceMode();
                if (modeResponse.success) schoolMode = modeResponse.data.mode || "subject";
            } catch { /* older server: keep subject-wise */ }
            setMode(schoolMode);
            const assignmentsResponse = await getMyAssignments(
                profileResponse.data.id
            );
            if (assignmentsResponse.success) {
                // Once a day / morning and afternoon: only the class teacher takes attendance
                const list = schoolMode === "subject"
                    ? assignmentsResponse.data
                    : assignmentsResponse.data.filter((a) => a.is_class_teacher);
                setAssignments(list);
                if (list.length > 0) {
                    setTeacherSubjectId(list[0].teacher_subject_id);
                }
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load your classes/subjects."
            );
        } finally {
            setLoadingAssignments(false);
        }
    }
    async function loadRoster() {
        setError("");
        setSuccess("");
        try {
            setLoadingRoster(true);
            const response = await getAttendanceRoster(teacherSubjectId, date, mode === "half_day" ? session : undefined);
            if (response.success) {
                setRoster(
                    response.data.map((s) => ({
                        ...s,
                        status: s.status || "Present"
                    }))
                );
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load the class roster."
            );
        } finally {
            setLoadingRoster(false);
        }
    }
    function setStudentStatus(studentId, status) {
        setRoster((list) =>
            list.map((s) =>
                s.student_id === studentId ? { ...s, status } : s
            )
        );
    }
    async function handleSave() {
        setError("");
        setSuccess("");
        try {
            setSaving(true);
            const response = await bulkMarkAttendance({
                teacher_subject_id: teacherSubjectId,
                attendance_date: date,
                session: mode === "half_day" ? session : undefined,
                records: roster.map((s) => ({
                    student_id: s.student_id,
                    status: s.status
                }))
            });
            if (response.success) {
                await loadRoster();
                const now = new Date().toLocaleTimeString(undefined, { timeZone: getSchoolTimezone() });
                setSuccess(`Attendance saved successfully at ${now}.`);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save attendance."
            );
        } finally {
            setSaving(false);
        }
    }
    if (loadingAssignments) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const offDay = !!dayStatus && !dayStatus.is_working;

    const selectedAssignment = assignments.find(
        (a) => a.teacher_subject_id === teacherSubjectId
    );

    const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: getSchoolTimezone() });
    const todayIso = fmt.format(new Date());
    const yesterdayIso = fmt.format(new Date(Date.now() - 86400000));

    function pickDate(v) {
        setDate(v);
        setDateKey((k) => k + 1);
    }

    function markAll(status) {
        setRoster((list) => list.map((s) => ({ ...s, status })));
    }

    const counts = {
        Present: roster.filter((s) => s.status === "Present").length,
        Absent: roster.filter((s) => s.status === "Absent").length,
        Late: roster.filter((s) => s.status === "Late").length
    };

    const shown = filter === "all" ? roster : roster.filter((s) => s.status === filter);

    return (
        <Box sx={{ maxWidth: 760, pb: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <Box
                    sx={{
                        width: 46, height: 46, borderRadius: "14px",
                        bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)",
                        boxShadow: "2px 2px 0 var(--sl-ink)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                >
                    <FactCheckIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>
                        Take Attendance
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {selectedAssignment
                            ? `${selectedAssignment.class_name} - ${selectedAssignment.section_name}${mode === "subject" ? ` · ${selectedAssignment.subject_name}` : mode === "half_day" ? ` · ${session}` : " · Full day"}`
                            : "Mark who is present, absent or late."}
                    </Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {assignments.length === 0 ? (
                <Alert severity="warning">
                    {mode === "subject"
                        ? "You don't have any classes/subjects assigned yet. Please contact your School Admin."
                        : "In this school attendance is taken by the class teacher once a day. You are not a class teacher yet. Please contact your School Admin."}
                </Alert>
            ) : (
                <Card sx={{ p: { xs: 2, md: 2.5 }, mb: 2, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)", mb: 0.75 }}>
                        {mode === "subject" ? "Class and subject" : "Your class"}
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                        {assignments.map((a) => (
                            <Box
                                key={a.teacher_subject_id}
                                role="button"
                                tabIndex={0}
                                onClick={() => { setTeacherSubjectId(a.teacher_subject_id); setFilter("all"); }}
                                onKeyDown={(e) => e.key === "Enter" && setTeacherSubjectId(a.teacher_subject_id)}
                                sx={pillSx(a.teacher_subject_id === teacherSubjectId)}
                            >
                                {a.class_name}-{a.section_name}{mode === "subject" ? ` · ${a.subject_name}` : ""}
                            </Box>
                        ))}
                    </Box>

                    {mode === "half_day" && (
                        <Box sx={{ display: "flex", gap: 0.75, mb: 2, alignItems: "center", flexWrap: "wrap" }}>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)", mr: 0.5 }}>Session</Typography>
                            {["Morning", "Afternoon"].map((x) => (
                                <Box key={x} role="button" tabIndex={0} aria-pressed={session === x}
                                    onClick={() => { setSession(x); setFilter("all"); }}
                                    onKeyDown={(e) => e.key === "Enter" && setSession(x)}
                                    sx={pillSx(session === x)}>
                                    {x}
                                </Box>
                            ))}
                        </Box>
                    )}

                    <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}>
                        <Box sx={{ width: { xs: "100%", sm: 220 } }}>
                            <SchoolDatePicker
                                key={dateKey}
                                label="Date"
                                value={date}
                                onChange={setDate}
                                maxDate={new Date()}
                                fullWidth
                            />
                        </Box>
                        <Box sx={{ display: "flex", gap: 0.75, pt: 1 }}>
                            <Box role="button" tabIndex={0} onClick={() => pickDate(todayIso)} sx={pillSx(date === todayIso)}>Today</Box>
                            <Box role="button" tabIndex={0} onClick={() => pickDate(yesterdayIso)} sx={pillSx(date === yesterdayIso)}>Yesterday</Box>
                        </Box>
                    </Box>
                </Card>
            )}

            {offDay && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    {prettyDate(date, { weekday: "long", day: "numeric", month: "short", year: "numeric" })} is{" "}
                    {dayStatus.reason === "Holiday"
                        ? `a school holiday (${dayStatus.name})`
                        : dayStatus.reason === "Weekend" ? "a weekend" : "a weekly off day"}.
                    {" "}Attendance isn't taken on this day. Pick another date. If school is open, ask the School Admin to add a Working Day in School Calendar.
                </Alert>
            )}

            {!offDay && loadingRoster && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={28} />
                </Box>
            )}

            {!offDay && !loadingRoster && selectedAssignment && roster.length === 0 && (
                <Card sx={{ p: 3, textAlign: "center", borderRadius: 3, border: "1px solid var(--sl-border)" }}>
                    <Typography color="text.secondary">
                        No students found in this class/section.
                    </Typography>
                </Card>
            )}

            {!offDay && !loadingRoster && roster.length > 0 && (
                <>
                    <StatChips
                        active={filter}
                        onPick={(f) => setFilter(f === filter ? "all" : f)}
                        items={[
                            { label: "Total", value: roster.length, filter: "all" },
                            { label: "Present", value: counts.Present, filter: "Present", tone: "#16A34A" },
                            { label: "Absent", value: counts.Absent, filter: "Absent", tone: "#DC2626" },
                            { label: "Late", value: counts.Late, filter: "Late", tone: "#D97706" }
                        ]}
                    />

                    <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap", alignItems: "center" }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, mr: 0.5 }}>Quick:</Typography>
                        <Box role="button" tabIndex={0} onClick={() => markAll("Present")} sx={{ ...pillSx(false), fontSize: "0.78rem", py: 0.4 }}>All present</Box>
                        <Box role="button" tabIndex={0} onClick={() => markAll("Absent")} sx={{ ...pillSx(false), fontSize: "0.78rem", py: 0.4 }}>All absent</Box>
                    </Box>

                    <Card sx={{ borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)", overflow: "hidden" }}>
                        {shown.length === 0 && (
                            <Typography sx={{ p: 2.5, color: "text.secondary", textAlign: "center", fontSize: "0.9rem" }}>
                                No students marked {filter.toLowerCase()}.
                            </Typography>
                        )}
                        {shown.map((student) => (
                            <Box
                                key={student.student_id}
                                data-testid="att-row"
                                sx={{
                                    display: "flex",
                                    alignItems: { xs: "stretch", sm: "center" },
                                    flexDirection: { xs: "column", sm: "row" },
                                    justifyContent: "space-between",
                                    gap: 1.25,
                                    px: 2,
                                    py: 1.5,
                                    borderBottom: "1px solid var(--sl-border)",
                                    "&:last-of-type": { borderBottom: "none" }
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                    <Box
                                        sx={{
                                            width: 38, height: 38, minWidth: 38, borderRadius: "50%",
                                            bgcolor: "var(--sl-accent)", color: "var(--sl-ink)",
                                            fontWeight: 800, fontSize: "0.85rem",
                                            display: "flex", alignItems: "center", justifyContent: "center"
                                        }}
                                    >
                                        {initialsOf(student)}
                                    </Box>
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 700 }} noWrap>
                                            {student.first_name} {student.last_name}
                                        </Typography>
                                        <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }} noWrap>
                                            {student.admission_no}
                                            {student.updated_at && (
                                                <> · recorded {toUtcDate(student.updated_at).toLocaleTimeString(undefined, { timeZone: getSchoolTimezone(), hour: "2-digit", minute: "2-digit" })}</>
                                            )}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Box sx={{ display: "flex", gap: 0.75 }}>
                                    {statuses.map((st) => (
                                        <Box
                                            key={st.value}
                                            role="button"
                                            tabIndex={0}
                                            aria-pressed={student.status === st.value}
                                            aria-label={`${st.value} ${student.first_name}`}
                                            onClick={() => setStudentStatus(student.student_id, st.value)}
                                            sx={{
                                                ...pillSx(student.status === st.value, st.color),
                                                flex: { xs: 1, sm: "none" },
                                                display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5,
                                                minHeight: 38
                                            }}
                                        >
                                            {st.icon}
                                            {st.value}
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        ))}
                    </Card>

                    <Box
                        sx={{
                            // Phone: the bar sits right under the last student, so it never hides anyone.
                            // Laptop: it sticks to the bottom of the page.
                            position: { xs: "static", md: "sticky" },
                            bottom: { md: 12 },
                            mt: 2, zIndex: 5,
                            display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5,
                            p: 1.25, pl: 2, borderRadius: 3, bgcolor: "#fff",
                            border: "1.5px solid var(--sl-ink)", boxShadow: "3px 3px 0 var(--sl-ink)"
                        }}
                    >
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700 }}>
                            {counts.Present} present · {counts.Absent} absent · {counts.Late} late
                        </Typography>
                        <Button
                            loading={saving}
                            loadingPosition="start"
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving}
                            sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                            {saving ? "Saving..." : "Save Attendance"}
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
}

export default TakeAttendancePage;
