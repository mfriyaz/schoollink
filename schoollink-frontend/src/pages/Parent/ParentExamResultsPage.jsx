import { useEffect, useState } from "react";
import {
    Box,
    Card,
    CircularProgress,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";
import { getMyChildren } from "../../services/postService";
import { getMarksForStudent } from "../../services/examService";
import { getStudentRemarks } from "../../services/reportCardService";
const panelSx = {
    p: { xs: 2, md: 2.5 },
    borderRadius: 3,
    border: "1px solid var(--sl-border)",
    boxShadow: "var(--sl-card-shadow)"
};
function ParentExamResultsPage() {
    const [children, setChildren] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [marks, setMarks] = useState([]);
    const [remarksByName, setRemarksByName] = useState({});
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadChildren();
    }, []);
    async function loadChildren() {
        try {
            const response = await getMyChildren();
            if (response.success && response.data.length > 0) {
                setChildren(response.data);
                setSelectedStudentId(response.data[0].student_id);
                await loadMarks(response.data[0].student_id);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    async function loadMarks(studentId) {
        try {
            const response = await getMarksForStudent(studentId);
            if (response.success) {
                setMarks(response.data);
            }
            try {
                const rem = await getStudentRemarks(studentId);
                const map = {};
                (rem.data || []).forEach((r) => { map[r.exam_name] = r.remarks; });
                setRemarksByName(map);
            } catch (e) {
                setRemarksByName({});
            }
        } catch (err) {
            console.error(err);
        }
    }
    async function handleChildChange(studentId) {
        setSelectedStudentId(studentId);
        setLoading(true);
        await loadMarks(studentId);
        setLoading(false);
    }
    // Group by exam name so results read as one exam at a time
    const marksByExam = marks.reduce((groups, mark) => {
        if (!groups[mark.exam_name]) {
            groups[mark.exam_name] = [];
        }
        groups[mark.exam_name].push(mark);
        return groups;
    }, {});
    return (
        <Box sx={{ maxWidth: 700 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 46,
                            height: 46,
                            borderRadius: "14px",
                            bgcolor: "var(--sl-accent)",
                            border: "1.5px solid var(--sl-ink)",
                            boxShadow: "2px 2px 0 var(--sl-ink)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <AssessmentIcon sx={{ color: "var(--sl-ink)" }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, color: "var(--sl-ink)" }}>
                        Exam Results
                    </Typography>
                </Box>
                {children.length > 1 && (
                    <TextField
                        select
                        size="small"
                        value={selectedStudentId}
                        onChange={(e) => handleChildChange(e.target.value)}
                        sx={{ minWidth: { xs: "100%", sm: 180 } }}
                    >
                        {children.map((c) => (
                            <MenuItem key={c.student_id} value={c.student_id}>{c.first_name} {c.last_name}</MenuItem>
                        ))}
                    </TextField>
                )}
            </Box>
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && marks.length === 0 && (
                <Card sx={{ ...panelSx }}>
                    <Typography color="text.secondary">
                        No exam results published yet.
                    </Typography>
                </Card>
            )}
            {!loading && Object.entries(marksByExam).map(([examName, examMarks]) => (
                <Card key={examName} sx={{ ...panelSx, mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", mb: 1.5, color: "var(--sl-ink)" }}>
                        {examName}
                    </Typography>
                    {examMarks.map((mark) => (
                        <Box
                            key={mark.id}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                py: 1.5,
                                borderBottom: "1px solid var(--sl-border)",
                                "&:last-of-type": { borderBottom: "none" }
                            }}
                        >
                            <Box>
                                <Typography sx={{ fontWeight: 600 }}>
                                    {mark.subject_name}
                                </Typography>
                                <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                                    {mark.marks_obtained} marks ({mark.percentage}%)
                                </Typography>
                            </Box>
                            <Box component="span" sx={{
                                px: 1.25, py: 0.25, borderRadius: 99, fontSize: "0.8rem", fontWeight: 800,
                                border: "1.5px solid var(--sl-ink)",
                                bgcolor: mark.result === "Pass" ? "#DCFCE7" : "#FEE2E2",
                                color: mark.result === "Pass" ? "#15803D" : "#B91C1C"
                            }}>
                                {mark.grade_name}
                            </Box>
                        </Box>
                    ))}
                    {remarksByName[examName] && (
                        <Box sx={{ mt: 1.5, p: 1.5, borderRadius: 2, bgcolor: "var(--sl-soft, #F1F5F9)", border: "1px dashed var(--sl-ink)" }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", mb: 0.5 }}>
                                Teacher's remarks
                            </Typography>
                            <Typography sx={{ fontSize: "0.9rem", whiteSpace: "pre-wrap" }}>
                                {remarksByName[examName]}
                            </Typography>
                        </Box>
                    )}
                </Card>
            ))}
        </Box>
    );
}
export default ParentExamResultsPage;
