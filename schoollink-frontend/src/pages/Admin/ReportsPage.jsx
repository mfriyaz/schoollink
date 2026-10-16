import { useEffect, useMemo, useState } from "react";

import {
    Alert,
    Autocomplete,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    LinearProgress,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";

import ReportRemarksEditor from "../../components/Admin/ReportRemarksEditor";
import { getStudents } from "../../services/studentService";
import { getAllExams } from "../../services/examService";
import {
    getReportCard,
    downloadReportCardPdf
} from "../../services/reportCardService";

function initials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function barColour(pct) {
    if (pct >= 75) return "#16A34A";
    if (pct >= 50) return "#F59E0B";
    return "#DC2626";
}

function studentLabel(s) {
    return `${s.first_name || ""} ${s.last_name || ""}`.trim() + (s.admission_no ? ` (${s.admission_no})` : "");
}

function ReportsPage() {

    const [students, setStudents] = useState([]);
    const [exams, setExams] = useState([]);

    const [student, setStudent] = useState(null);
    const [examId, setExamId] = useState("");

    const [loadingOptions, setLoadingOptions] = useState(true);
    const [loadingReport, setLoadingReport] = useState(false);
    const [downloading, setDownloading] = useState(false);

    const [report, setReport] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        loadOptions();
    }, []);

    // show the report as soon as a student and an exam are chosen
    useEffect(() => {
        if (student && examId) {
            handleViewReport();
        } else {
            setReport(null);
        }
    }, [student, examId]);

    async function loadOptions() {
        try {
            const [studentsResponse, examsResponse] = await Promise.all([getStudents(), getAllExams()]);
            if (studentsResponse.success) setStudents(studentsResponse.data);
            if (examsResponse.success) setExams(examsResponse.data);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load students/exams.");
        } finally {
            setLoadingOptions(false);
        }
    }

    async function handleViewReport() {
        setError("");
        setReport(null);

        try {
            setLoadingReport(true);
            const response = await getReportCard(student.id, examId);
            if (response.success) {
                setReport(response);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load this report card.");
        } finally {
            setLoadingReport(false);
        }
    }

    async function handleDownloadPdf() {
        setError("");

        try {
            setDownloading(true);
            const blob = await downloadReportCardPdf(student.id, examId);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `report-card-${report.student.admission_no}.pdf`;
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to download the PDF.");
        } finally {
            setDownloading(false);
        }
    }

    const insight = useMemo(() => {
        if (!report || !report.subjects || report.subjects.length === 0) return null;
        const subs = report.subjects.map((s) => ({ ...s, pct: Number(s.percentage) || 0 }));
        const sorted = [...subs].sort((a, b) => b.pct - a.pct);
        const failed = subs.filter((s) => s.result !== "Pass");
        return { best: sorted[0], lowest: sorted[sorted.length - 1], failed };
    }, [report]);

    if (loadingOptions) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const overall = report ? Number(report.summary.percentage) || 0 : 0;

    return (

        <Box sx={{ maxWidth: 900 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: "var(--sl-soft, var(--sl-soft))", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <DescriptionIcon sx={{ color: "var(--sl-ink, var(--sl-primary))" }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Reports</Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                        Pick a student and an exam to see the report card
                    </Typography>
                </Box>
            </Box>

            {/* ---------- pickers ---------- */}
            <Card sx={{ p: { xs: 2, sm: 2.5 }, mb: 2, borderRadius: 3 }}>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1.4fr 1fr" }, gap: 2 }}>
                    <Autocomplete
                        options={students}
                        value={student}
                        onChange={(e, v) => setStudent(v)}
                        getOptionLabel={studentLabel}
                        isOptionEqualToValue={(a, b) => a.id === b.id}
                        renderInput={(params) => <TextField {...params} label="Student" placeholder="Type a name or admission no." />}
                    />
                    <TextField select label="Exam" value={examId} onChange={(e) => setExamId(e.target.value)}>
                        {exams.map((e) => (
                            <MenuItem key={e.id} value={e.id}>{e.exam_name}</MenuItem>
                        ))}
                    </TextField>
                </Box>

            </Card>

            {!student || !examId ? (
                !report && (
                    <Card sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No report card selected</Typography>
                        <Typography color="text.secondary">Choose a student and an exam above and the report card appears here.</Typography>
                    </Card>
                )
            ) : null}

            {loadingReport && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                    <CircularProgress size={28} />
                </Box>
            )}

            {report && !loadingReport && (
                <>
                    {/* ---------- banner ---------- */}
                    <Box
                        data-testid="report-banner"
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 2,
                            flexWrap: "wrap",
                            p: { xs: 2, sm: 2.5 },
                            mb: 2,
                            borderRadius: 4,
                            bgcolor: "var(--sl-banner, var(--sl-primary))",
                            color: "var(--sl-on-banner, #fff)",
                            border: "var(--sl-banner-border, none)",
                            boxShadow: "var(--sl-banner-shadow, none)"
                        }}
                    >
                        <Box sx={{ width: 56, height: 56, borderRadius: "50%", bgcolor: "var(--sl-on-banner, #fff)", color: "var(--sl-banner, var(--sl-primary))", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "1.2rem" }}>
                            {initials(report.student.name)}
                        </Box>

                        <Box sx={{ flex: 1, minWidth: 180 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", lineHeight: 1.2 }}>{report.student.name}</Typography>
                            <Typography sx={{ fontSize: "0.86rem", opacity: 0.9 }}>
                                {report.student.admission_no} · {report.student.class} - {report.student.section}
                            </Typography>
                            <Typography sx={{ fontSize: "0.86rem", opacity: 0.9 }}>{report.exam}</Typography>
                        </Box>

                        <Box sx={{ textAlign: "center" }}>
                            <Typography sx={{ fontWeight: 800, fontSize: "2rem", lineHeight: 1 }}>{overall}%</Typography>
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, opacity: 0.9 }}>OVERALL</Typography>
                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadPdf}
                            disabled={downloading}
                            sx={{ bgcolor: "#fff" }}
                        >
                            {downloading ? "Downloading..." : "Download PDF"}
                        </Button>
                    </Box>

                    {/* ---------- summary tiles ---------- */}
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1, mb: 2 }}>
                        {[
                            { label: "Total marks", value: `${report.summary.total_marks} / ${report.summary.maximum_marks}` },
                            { label: "Subjects", value: report.subjects.length },
                            { label: "Best subject", value: insight ? insight.best.subject_name : "-", sub: insight ? `${insight.best.pct}%` : "", tone: "#166534" },
                            insight && insight.failed.length > 0
                                ? { label: "Needs attention", value: `${insight.failed.length} subject${insight.failed.length === 1 ? "" : "s"}`, sub: insight.failed.map((f) => f.subject_name).join(", "), tone: "#B91C1C" }
                                : { label: "Result", value: "All passed", tone: "#166534" }
                        ].map((t) => (
                            <Box key={t.label} sx={{ p: 1.5, borderRadius: 3, bgcolor: "#fff", border: "1px solid var(--sl-border, #E2E8F0)", minWidth: 0 }}>
                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 0.4, color: "text.secondary" }}>{t.label.toUpperCase()}</Typography>
                                <Typography sx={{ fontWeight: 800, color: t.tone || "inherit", overflowWrap: "anywhere" }}>{t.value}</Typography>
                                {t.sub && <Typography sx={{ fontSize: "0.76rem", color: "text.secondary", overflowWrap: "anywhere" }}>{t.sub}</Typography>}
                            </Box>
                        ))}
                    </Box>

                    {/* ---------- subjects ---------- */}
                    <Card sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 3 }}>
                        <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.4, color: "text.secondary", mb: 1 }}>
                            SUBJECT MARKS
                        </Typography>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                            {report.subjects.map((s, i) => {
                                const pct = Math.max(0, Math.min(100, Number(s.percentage) || 0));
                                const pass = s.result === "Pass";
                                return (
                                    <Box key={i} data-testid="subject-row" sx={{ p: 1.25, borderRadius: 2.5, bgcolor: "var(--sl-page2, #F8FAFC)" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.75 }}>
                                            <Typography sx={{ fontWeight: 700, flex: 1, minWidth: 0 }} noWrap>{s.subject_name}</Typography>
                                            <Typography sx={{ fontSize: "0.88rem", color: "text.secondary" }}>
                                                <b style={{ color: "inherit" }}>{s.marks_obtained}</b> / {s.max_marks}
                                            </Typography>
                                            <Typography sx={{ fontWeight: 800, minWidth: 48, textAlign: "right" }}>{s.percentage}%</Typography>
                                            <Chip
                                                size="small"
                                                label={s.grade_name}
                                                sx={pass
                                                    ? { bgcolor: "#DCFCE7", color: "#166534", fontWeight: 800, minWidth: 40 }
                                                    : { bgcolor: "#FEE2E2", color: "#B91C1C", fontWeight: 800, minWidth: 40 }}
                                            />
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={pct}
                                            sx={{ height: 7, borderRadius: 4, bgcolor: "#E2E8F0", "& .MuiLinearProgress-bar": { bgcolor: barColour(pct), borderRadius: 4 } }}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>

                        <ReportRemarksEditor
                            studentId={report.student.student_id}
                            examId={examId}
                            initial={report.remarks || ""}
                            onSaved={(value) => setReport((prev) => ({ ...prev, remarks: value }))}
                        />
                    </Card>
                </>
            )}

        </Box>

    );

}

export default ReportsPage;
