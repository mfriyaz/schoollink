import { useEffect, useState } from "react";
import { Box, Card, Chip, CircularProgress, LinearProgress, Typography } from "@mui/material";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";
import { getMyChildren } from "../../services/postService";
import { getMarksForStudent } from "../../services/examService";
import { getStudentRemarks, downloadReportCardPdf } from "../../services/reportCardService";
import { notify } from "../../utils/notify";

const panelSx = {
    p: { xs: 2, md: 2.5 },
    borderRadius: 3,
    border: "1px solid var(--sl-border)",
    boxShadow: "var(--sl-card-shadow)"
};

const pillSx = {
    borderRadius: 99,
    border: "1.5px solid var(--sl-ink)",
    color: "var(--sl-ink)",
    fontWeight: 700,
    textTransform: "none",
    px: 1.75,
    py: 0.6,
    fontSize: "0.85rem",
    display: "inline-flex",
    alignItems: "center",
    gap: 0.75,
    bgcolor: "#fff",
    cursor: "pointer"
};

function barColor(pct) {
    if (pct >= 75) return "#16A34A";
    if (pct >= 50) return "#D97706";
    return "#DC2626";
}

function ParentExamResultsPage() {
    const [children, setChildren] = useState([]);
    const [studentId, setStudentId] = useState("");
    const [marks, setMarks] = useState([]);
    const [remarksByName, setRemarksByName] = useState({});
    const [loading, setLoading] = useState(true);
    const [busyExam, setBusyExam] = useState(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await getMyChildren();
                if (res.success && res.data.length > 0) {
                    setChildren(res.data);
                    setStudentId(res.data[0].student_id);
                    await loadMarks(res.data[0].student_id);
                }
            } catch (e) { console.error(e); }
            finally { setLoading(false); }
        })();
    }, []);

    async function loadMarks(id) {
        try {
            const res = await getMarksForStudent(id);
            setMarks(res.success ? res.data : []);
            try {
                const rem = await getStudentRemarks(id);
                const map = {};
                (rem.data || []).forEach((r) => { map[r.exam_name] = r.remarks; });
                setRemarksByName(map);
            } catch (e) { setRemarksByName({}); }
        } catch (e) { console.error(e); setMarks([]); }
    }

    async function pickChild(id) {
        if (id === studentId) return;
        setStudentId(id);
        setLoading(true);
        await loadMarks(id);
        setLoading(false);
    }

    async function downloadPdf(examId, examName) {
        setBusyExam(examId);
        try {
            const blob = await downloadReportCardPdf(studentId, examId);
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `Report Card - ${examName}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            setTimeout(() => URL.revokeObjectURL(url), 5000);
        } catch (e) {
            notify("Report card is not ready yet.", "info");
        } finally {
            setBusyExam(null);
        }
    }

    const groups = [];
    marks.forEach((m) => {
        const key = m.exam_id || m.exam_name;
        let g = groups.find((x) => x.key === key);
        if (!g) { g = { key, examId: m.exam_id, name: m.exam_name, items: [] }; groups.push(g); }
        g.items.push(m);
    });

    return (
        <Box sx={{ maxWidth: 700 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 46, height: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AssessmentIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, color: "var(--sl-ink)" }}>
                    Exam Results
                </Typography>
            </Box>

            {children.length > 1 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                    {children.map((c) => (
                        <Chip
                            key={c.student_id}
                            label={c.first_name}
                            onClick={() => pickChild(c.student_id)}
                            sx={{
                                fontWeight: 700,
                                border: "1.5px solid var(--sl-ink)",
                                bgcolor: c.student_id === studentId ? "var(--sl-accent)" : "#fff",
                                color: "var(--sl-ink)"
                            }}
                        />
                    ))}
                </Box>
            )}

            {loading && <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>}

            {!loading && marks.length === 0 && (
                <Card sx={panelSx}>
                    <Typography color="text.secondary">No exam results published yet.</Typography>
                </Card>
            )}

            {!loading && groups.map((g) => {
                const pcts = g.items.map((m) => Number(m.percentage) || 0);
                const avg = pcts.length ? Math.round(pcts.reduce((a, b) => a + b, 0) / pcts.length) : 0;
                const total = g.items.reduce((a, m) => a + (Number(m.marks_obtained) || 0), 0);
                const allPass = g.items.every((m) => m.result === "Pass");
                return (
                    <Card key={g.key} sx={{ ...panelSx, mb: 2.5 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, flexWrap: "wrap" }}>
                            <Box>
                                <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--sl-ink)" }}>{g.name}</Typography>
                                <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                                    {g.items.length} subject{g.items.length > 1 ? "s" : ""} · Total {total} marks
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: "right" }}>
                                <Typography sx={{ fontWeight: 800, fontSize: "1.6rem", lineHeight: 1, color: barColor(avg) }}>{avg}%</Typography>
                                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: allPass ? "#15803D" : "#B91C1C" }}>
                                    {allPass ? "Passed all subjects" : "Needs attention"}
                                </Typography>
                            </Box>
                        </Box>

                        <Box sx={{ mt: 1.5 }}>
                            {g.items.map((m) => {
                                const pct = Number(m.percentage) || 0;
                                const pass = m.result === "Pass";
                                return (
                                    <Box key={m.id} sx={{ py: 1.25, borderTop: "1px solid var(--sl-border)" }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1 }}>
                                            <Box sx={{ minWidth: 0 }}>
                                                <Typography sx={{ fontWeight: 700 }} noWrap>{m.subject_name}</Typography>
                                                <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                                                    {m.marks_obtained} marks · {pct}%
                                                </Typography>
                                            </Box>
                                            <Box component="span" sx={{
                                                px: 1.25, py: 0.25, borderRadius: 99, fontSize: "0.8rem", fontWeight: 800,
                                                border: "1.5px solid var(--sl-ink)",
                                                bgcolor: pass ? "#DCFCE7" : "#FEE2E2",
                                                color: pass ? "#15803D" : "#B91C1C"
                                            }}>
                                                {m.grade_name}
                                            </Box>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.min(100, pct)}
                                            sx={{
                                                mt: 0.9, height: 8, borderRadius: 99, bgcolor: "var(--sl-soft, #F1F5F9)",
                                                "& .MuiLinearProgress-bar": { borderRadius: 99, bgcolor: barColor(pct) }
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>

                        {remarksByName[g.name] && (
                            <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: "var(--sl-soft, #F1F5F9)", border: "1px dashed var(--sl-ink)" }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", mb: 0.5 }}>Teacher's remarks</Typography>
                                <Typography sx={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>{remarksByName[g.name]}</Typography>
                            </Box>
                        )}

                        {g.examId && (
                            <Box sx={{ mt: 1.75 }}>
                                <Box
                                    component="button"
                                    type="button"
                                    disabled={busyExam === g.examId}
                                    onClick={() => downloadPdf(g.examId, g.name)}
                                    sx={{ ...pillSx, bgcolor: "var(--sl-accent)", opacity: busyExam === g.examId ? 0.6 : 1 }}
                                >
                                    <DownloadIcon sx={{ fontSize: 18 }} />
                                    {busyExam === g.examId ? "Preparing…" : "Download report card"}
                                </Box>
                            </Box>
                        )}
                    </Card>
                );
            })}
        </Box>
    );
}

export default ParentExamResultsPage;
