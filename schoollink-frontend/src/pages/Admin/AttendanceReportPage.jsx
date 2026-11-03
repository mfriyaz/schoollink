import { useCallback, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
    Alert, Box, Button, Card, MenuItem, Skeleton, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, TextField, Typography
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";

import PageHeader from "../../components/common/PageHeader";
import { getAttendanceReport, downloadAttendanceReport } from "../../services/attendanceReportService";

function Kpi({ label, value, tone }) {
    return (
        <Box sx={{ p: 1.75, minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "text.secondary" }}>{label}</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.55rem", lineHeight: 1.2, color: tone || "var(--sl-ink)" }}>{value}</Typography>
        </Box>
    );
}

function AttendanceReportPage() {

    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [group, setGroup] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);

    // group is "classId-sectionId" or ""
    const params = useCallback((f, t, g) => {
        const p = {};
        if (f) p.from = f;
        if (t) p.to = t;
        if (g) { const [c, s] = g.split("-"); p.class_id = c; p.section_id = s; }
        return p;
    }, []);

    const load = useCallback(async (f, t, g) => {
        try {
            setLoading(true);
            setError("");
            const res = await getAttendanceReport(params(f, t, g));
            setData(res.data);
            if (!f) setFrom(res.data.from);
            if (!t) setTo(res.data.to);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load the attendance report.");
        } finally {
            setLoading(false);
        }
    }, [params]);

    useEffect(() => { load("", "", ""); }, [load]);

    // class list comes from the first (unfiltered) load
    const [groups, setGroups] = useState([]);
    useEffect(() => {
        if (!data || groups.length) return;
        const seen = new Map();
        data.rows.forEach((r) => seen.set(`${r.class_id}-${r.section_id}`, `${r.class_name} - ${r.section_name}`));
        setGroups([...seen.entries()]);
    }, [data, groups.length]);

    const apply = (f, t, g) => { if (f && t) load(f, t, g); };

    const download = async () => {
        try {
            setDownloading(true);
            const blob = await downloadAttendanceReport(params(from, to, group));
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `attendance-${from}-to-${to}.xlsx`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch {
            setError("Unable to download the Excel file.");
        } finally {
            setDownloading(false);
        }
    };

    const s = data?.summary;
    const warnLimit = 75;
    const rows = useMemo(() => data?.rows || [], [data]);

    return (
        <Box sx={{ maxWidth: 1180 }}>

            <PageHeader
                eyebrow="Attendance"
                title="Attendance report"
                subtitle="Each student's attendance for any date range. Download it as Excel."
                avatar={<AssessmentIcon sx={{ fontSize: 22 }} />}
                action={
                    <Button variant="contained" startIcon={<DownloadIcon />} onClick={download} disabled={downloading || !data}>
                        {downloading ? "Preparing..." : "Download Excel"}
                    </Button>
                }
            />

            <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", mb: 2 }}>
                <TextField type="date" size="small" label="From" value={from} InputLabelProps={{ shrink: true }}
                    onChange={(e) => { setFrom(e.target.value); apply(e.target.value, to, group); }} />
                <TextField type="date" size="small" label="To" value={to} InputLabelProps={{ shrink: true }}
                    onChange={(e) => { setTo(e.target.value); apply(from, e.target.value, group); }} />
                <TextField select size="small" label="Class" value={group} sx={{ minWidth: 170 }}
                    onChange={(e) => { setGroup(e.target.value); apply(from, to, e.target.value); }}>
                    <MenuItem value="">All classes</MenuItem>
                    {groups.map(([k, label]) => <MenuItem key={k} value={k}>{label}</MenuItem>)}
                </TextField>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && !data && <Skeleton variant="rounded" height={260} />}

            {data && (
                <>
                    <Card sx={{ mb: 2, display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, "& > *": { borderRight: "1px solid var(--sl-border)", borderBottom: { xs: "1px solid var(--sl-border)", md: "none" } } }}>
                        <Kpi label="Students" value={s.students} />
                        <Kpi label="Attendance" value={s.percent === null ? "-" : `${s.percent}%`} tone="#15803D" />
                        <Kpi label="Absent days" value={s.absent_days} tone={s.absent_days ? "#B91C1C" : undefined} />
                        <Kpi label="Late days" value={s.late_days} tone={s.late_days ? "#B45309" : undefined} />
                    </Card>

                    <Card sx={{ opacity: loading ? 0.6 : 1 }}>
                        <TableContainer>
                            <Table size="small" data-testid="report-table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Student</TableCell>
                                        <TableCell>Class</TableCell>
                                        <TableCell align="right">Days</TableCell>
                                        <TableCell align="right">Late</TableCell>
                                        <TableCell align="right">Absent</TableCell>
                                        <TableCell align="right">Attendance</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {rows.map((r) => (
                                        <TableRow key={r.student_id} data-testid="report-row">
                                            <TableCell sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                                                <RouterLink to={`/students/${r.student_id}`} style={{ color: "inherit" }}>{r.first_name} {r.last_name || ""}</RouterLink>
                                            </TableCell>
                                            <TableCell sx={{ whiteSpace: "nowrap" }}>{r.class_name} - {r.section_name}</TableCell>
                                            <TableCell align="right">{r.recorded}</TableCell>
                                            <TableCell align="right">{r.late}</TableCell>
                                            <TableCell align="right" sx={{ color: r.absent ? "#B91C1C" : undefined }}>{r.absent}</TableCell>
                                            <TableCell align="right" sx={{ fontWeight: 800, color: r.percent === null ? "text.secondary" : r.percent < warnLimit ? "#B91C1C" : "#15803D" }}>
                                                {r.percent === null ? "-" : `${r.percent}%`}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                    {rows.length === 0 && (
                                        <TableRow><TableCell colSpan={6} sx={{ color: "text.secondary" }}>No students found.</TableCell></TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Card>
                </>
            )}
        </Box>
    );
}

export default AttendanceReportPage;
