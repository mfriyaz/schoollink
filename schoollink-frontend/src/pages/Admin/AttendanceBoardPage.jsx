import { useCallback, useEffect, useState } from "react";
import {
    Alert, Box, Button, Card, LinearProgress, Skeleton, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/RefreshRounded";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";

import PageHeader from "../../components/common/PageHeader";
import { Link as RouterLink } from "react-router-dom";
import { getAttendanceBoard } from "../../services/attendanceBoardService";

const STATUS = {
    done: { label: "Submitted", fg: "#15803D", bg: "#DCFCE7" },
    partial: { label: "Partly marked", fg: "#B45309", bg: "#FEF3C7" },
    not_submitted: { label: "Not submitted", fg: "#B91C1C", bg: "#FEE2E2" }
};

function Pill({ s }) {
    const c = STATUS[s];
    return (
        <Box component="span" sx={{ display: "inline-block", px: 1.1, py: 0.2, borderRadius: 99, fontSize: "0.74rem", fontWeight: 700, color: c.fg, bgcolor: c.bg, whiteSpace: "nowrap" }}>
            {c.label}
        </Box>
    );
}

function Kpi({ label, value, tone }) {
    return (
        <Box sx={{ p: 1.75, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "text.secondary" }}>{label}</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.55rem", lineHeight: 1.2, color: tone || "var(--sl-ink)" }}>{value}</Typography>
        </Box>
    );
}

function todayLocal() {
    const d = new Date();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

function AttendanceBoardPage() {

    const [date, setDate] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    const load = useCallback(async (d) => {
        try {
            setLoading(true);
            setError("");
            const res = await getAttendanceBoard(d || undefined);
            setData(res.data);
            if (!d) setDate(res.data.date);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load the attendance board.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(""); }, [load]);

    // Keep today's board fresh while it is open
    useEffect(() => {
        if (!data || data.date !== todayLocal()) return undefined;
        const t = setInterval(() => load(data.date), 60000);
        return () => clearInterval(t);
    }, [data, load]);

    const s = data?.summary;
    const pending = (data?.classes || []).filter((c) => c.status !== "done");

    return (
        <Box sx={{ maxWidth: 1180 }}>

            <PageHeader
                eyebrow="Attendance"
                title="Attendance board"
                subtitle="Every class for one day. Updates as class teachers submit."
                avatar={<FactCheckIcon sx={{ fontSize: 22 }} />}
                action={
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
                        <TextField
                            type="date"
                            size="small"
                            value={date}
                            onChange={(e) => { setDate(e.target.value); if (e.target.value) load(e.target.value); }}
                            inputProps={{ "aria-label": "Date" }}
                        />
                        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => load(date)}>Refresh</Button>
                    </Box>
                }
            />

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && !data && <Skeleton variant="rounded" height={260} />}

            {data && (
                <>
                    <Card sx={{ mb: 2, display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(5, 1fr)" }, "& > *": { borderRight: "1px solid var(--sl-border)", borderBottom: { xs: "1px solid var(--sl-border)", md: "none" } } }}>
                        <Kpi label="On roll" value={s.on_roll} />
                        <Kpi label="Present" value={s.percent === null ? "-" : `${s.percent}%`} tone="#15803D" />
                        <Kpi label="Absent" value={s.absent} tone={s.absent ? "#B91C1C" : undefined} />
                        <Kpi label="Late" value={s.late} tone={s.late ? "#B45309" : undefined} />
                        <Kpi label="Classes pending" value={`${s.not_submitted + s.partial} of ${s.classes}`} tone={s.not_submitted + s.partial ? "#B91C1C" : "#15803D"} />
                    </Card>

                    {pending.length > 0 && (
                        <Alert severity="warning" sx={{ mb: 2 }}>
                            Attendance is not complete for {pending.length} {pending.length === 1 ? "class" : "classes"}:{" "}
                            {pending.map((c) => `${c.class_name}-${c.section_name}${c.class_teacher ? ` (${c.class_teacher})` : ""}`).join(", ")}.
                        </Alert>
                    )}

                    <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", mb: 1 }}>Classes</Typography>

                    <TableContainer sx={{ bgcolor: "#fff", mb: 3 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Class</TableCell>
                                    <TableCell>Class teacher</TableCell>
                                    <TableCell align="right">On roll</TableCell>
                                    <TableCell align="right">Present</TableCell>
                                    <TableCell align="right">Late</TableCell>
                                    <TableCell align="right">Absent</TableCell>
                                    <TableCell sx={{ minWidth: 150 }}>Attendance</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.classes.map((c) => (
                                    <TableRow key={`${c.class_id}-${c.section_id}`} data-testid="board-row">
                                        <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{c.class_name} - {c.section_name}</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>{c.class_teacher || "-"}</TableCell>
                                        <TableCell align="right">{c.on_roll}</TableCell>
                                        <TableCell align="right">{c.status === "not_submitted" ? "-" : c.present}</TableCell>
                                        <TableCell align="right">{c.status === "not_submitted" ? "-" : c.late}</TableCell>
                                        <TableCell align="right" sx={{ color: c.absent ? "#B91C1C" : undefined, fontWeight: c.absent ? 700 : 400 }}>{c.status === "not_submitted" ? "-" : c.absent}</TableCell>
                                        <TableCell>
                                            {c.percent === null ? "-" : (
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                    <LinearProgress variant="determinate" value={c.percent} sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: "var(--sl-soft2)", "& .MuiLinearProgress-bar": { bgcolor: c.percent >= 90 ? "#16A34A" : c.percent >= 80 ? "#F59E0B" : "#DC2626" } }} />
                                                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, minWidth: 38 }}>{c.percent}%</Typography>
                                                </Box>
                                            )}
                                        </TableCell>
                                        <TableCell><Pill s={c.status} /></TableCell>
                                    </TableRow>
                                ))}
                                {data.classes.length === 0 && (
                                    <TableRow><TableCell colSpan={8} sx={{ textAlign: "center", color: "text.secondary", py: 3 }}>No classes with students yet.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", mb: 0.25 }}>Absent today: follow up</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.84rem", mb: 1 }}>
                        Students marked absent, or absent for half the day, with the parent's number.{s.absent_on_leave > 0 && ` ${s.absent_on_leave} of them ${s.absent_on_leave === 1 ? "is" : "are"} on approved leave.`}
                    </Typography>

                    <TableContainer sx={{ bgcolor: "#fff" }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Class</TableCell>
                                    <TableCell>Parent</TableCell>
                                    <TableCell>Phone</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {data.absentees.map((a) => (
                                    <TableRow key={a.student_id} data-testid="absent-row">
                                        <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                                            <RouterLink to={`/students/${a.student_id}`} style={{ color: "inherit" }}>{a.first_name} {a.last_name || ""}</RouterLink>
                                        </TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>{a.class_name} - {a.section_name}</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>{a.father_name || "-"}</TableCell>
                                        <TableCell sx={{ whiteSpace: "nowrap" }}>
                                            {a.parent_phone ? <a href={`tel:${a.parent_phone}`} style={{ color: "inherit", fontWeight: 600 }}>{a.parent_phone}</a> : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <Box component="span" sx={{ px: 1.1, py: 0.2, borderRadius: 99, fontSize: "0.74rem", fontWeight: 700, bgcolor: a.on_leave ? "var(--sl-soft)" : a.state === "Absent" ? "#FEE2E2" : "#FEF3C7", color: a.on_leave ? "var(--sl-primary-dark)" : a.state === "Absent" ? "#B91C1C" : "#B45309" }}>
                                                {a.on_leave ? `${a.state} · on leave` : a.state}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {data.absentees.length === 0 && (
                                    <TableRow><TableCell colSpan={5} sx={{ textAlign: "center", color: "text.secondary", py: 3 }}>
                                        {s.marked === 0 ? "No attendance has been taken yet for this day." : "Nobody is absent."}
                                    </TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
        </Box>
    );
}

export default AttendanceBoardPage;
