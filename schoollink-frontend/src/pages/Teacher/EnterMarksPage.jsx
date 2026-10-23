import { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    TextField,
    Typography
} from "@mui/material";
import StatChips from "../../components/common/StatChips";
import GradeIcon from "@mui/icons-material/GradeOutlined";
import {
    getMyTeacherProfile,
    getMyAssignments
} from "../../services/postService";
import {
    getAllExams,
    getSubjectsByExam,
    getMarksRoster,
    bulkSaveMarks
} from "../../services/examService";
const pillSx = (active) => ({
    px: 1.5,
    py: 0.6,
    borderRadius: 99,
    cursor: "pointer",
    userSelect: "none",
    fontSize: "0.84rem",
    fontWeight: 700,
    border: "1.5px solid var(--sl-ink)",
    bgcolor: active ? "var(--sl-accent)" : "transparent",
    color: "var(--sl-ink)",
    "&:hover": { bgcolor: active ? undefined : "var(--sl-soft)" }
});

function initialsOf(s) {
    return `${(s.first_name || "?")[0]}${(s.last_name || "")[0] || ""}`.toUpperCase();
}

function EnterMarksPage() {
    const [exams, setExams] = useState([]);
    const [examId, setExamId] = useState("");
    const [myAssignments, setMyAssignments] = useState([]);
    const [examSubjects, setExamSubjects] = useState([]);
    const [examSubjectId, setExamSubjectId] = useState("");
    const [roster, setRoster] = useState([]);
    const [maxMarks, setMaxMarks] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingRoster, setLoadingRoster] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [filter, setFilter] = useState("all");
    useEffect(() => {
        loadInitial();
    }, []);
    useEffect(() => {
        if (examId) {
            loadExamSubjects();
        }
    }, [examId]);
    useEffect(() => {
        if (examSubjectId) {
            loadRoster();
        }
    }, [examSubjectId]);
    async function loadInitial() {
        try {
            const profileResponse = await getMyTeacherProfile();
            if (!profileResponse.success) {
                setError(profileResponse.message);
                return;
            }
            const [examsResponse, assignmentsResponse] = await Promise.all([
                getAllExams(),
                getMyAssignments(profileResponse.data.id)
            ]);
            if (examsResponse.success) {
                setExams(examsResponse.data);
                if (examsResponse.data.length > 0) {
                    setExamId(examsResponse.data[0].id);
                }
            }
            if (assignmentsResponse.success) {
                setMyAssignments(assignmentsResponse.data);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load exams."
            );
        } finally {
            setLoading(false);
        }
    }
    async function loadExamSubjects() {
        setError("");
        try {
            const response = await getSubjectsByExam(examId);
            if (response.success) {
                // Only show subjects that belong to THIS teacher's
                // own class/subject assignments.
                const myTeacherSubjectIds = myAssignments.map(
                    (a) => a.teacher_subject_id
                );
                const mine = response.data.filter((es) =>
                    myTeacherSubjectIds.includes(es.teacher_subject_id)
                );
                setExamSubjects(mine);
                setExamSubjectId(mine.length > 0 ? mine[0].id : "");
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to load subjects for this exam."
            );
        }
    }
    async function loadRoster() {
        setError("");
        setSuccess("");
        try {
            setLoadingRoster(true);
            const selectedExamSubject = examSubjects.find(
                (es) => es.id === examSubjectId
            );
            setMaxMarks(selectedExamSubject ? selectedExamSubject.max_marks : 0);
            const response = await getMarksRoster(examSubjectId);
            if (response.success) {
                setRoster(
                    response.data.map((s) => ({
                        ...s,
                        marks_obtained: s.marks_obtained ?? ""
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
    function setStudentMarks(studentId, value) {
        setRoster((list) =>
            list.map((s) =>
                s.student_id === studentId ? { ...s, marks_obtained: value } : s
            )
        );
    }
    async function handleSave() {
        setError("");
        setSuccess("");
        const invalid = roster.find((s) =>
            s.marks_obtained !== "" &&
            (Number(s.marks_obtained) < 0 || Number(s.marks_obtained) > Number(maxMarks))
        );
        if (invalid) {
            setError(`Marks must be between 0 and ${maxMarks}.`);
            return;
        }
        try {
            setSaving(true);
            const response = await bulkSaveMarks({
                exam_subject_id: examSubjectId,
                records: roster
                    .filter((s) => s.marks_obtained !== "")
                    .map((s) => ({
                        student_id: s.student_id,
                        marks_obtained: s.marks_obtained
                    }))
            });
            if (response.success) {
                setSuccess("Marks saved successfully.");
                await loadRoster();
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save marks."
            );
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

    const max = Number(maxMarks) || 0;

    const isInvalid = (s) =>
        s.marks_obtained !== "" &&
        (Number(s.marks_obtained) < 0 || Number(s.marks_obtained) > max);

    const entered = roster.filter((s) => s.marks_obtained !== "").length;
    const pending = roster.length - entered;
    const invalidCount = roster.filter(isInvalid).length;

    const shown =
        filter === "pending" ? roster.filter((s) => s.marks_obtained === "")
        : filter === "entered" ? roster.filter((s) => s.marks_obtained !== "")
        : roster;

    const selectedExam = exams.find((e) => e.id === examId);

    const labelFor = (es) => {
        const assignment = myAssignments.find((a) => a.teacher_subject_id === es.teacher_subject_id);
        return assignment
            ? `${assignment.class_name}-${assignment.section_name} · ${assignment.subject_name}`
            : `Subject #${es.id}`;
    };

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
                    <GradeIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>
                        Enter Marks
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {selectedExam ? selectedExam.exam_name : "Record exam marks for your classes."}
                    </Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {exams.length === 0 ? (
                <Alert severity="warning">No exams have been created yet.</Alert>
            ) : (
                <Card sx={{ p: { xs: 2, md: 2.5 }, mb: 2, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)", mb: 0.75 }}>Exam</Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: examSubjects.length > 0 ? 2 : 0 }}>
                        {exams.map((e) => (
                            <Box
                                key={e.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => { setExamId(e.id); setFilter("all"); }}
                                onKeyDown={(ev) => ev.key === "Enter" && setExamId(e.id)}
                                sx={pillSx(e.id === examId)}
                            >
                                {e.exam_name}
                            </Box>
                        ))}
                    </Box>

                    {myAssignments.length > 0 && (
                        <>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)", mb: 0.75, mt: 2 }}>Your classes</Typography>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                {myAssignments.map((a) => {
                                    const es = examSubjects.find((x) => x.teacher_subject_id === a.teacher_subject_id);
                                    const label = `${a.class_name}-${a.section_name} · ${a.subject_name}`;
                                    if (!es) {
                                        return (
                                            <Box
                                                key={a.teacher_subject_id}
                                                data-testid="not-in-exam"
                                                title="Not added to this exam yet"
                                                sx={{ ...pillSx(false), opacity: 0.5, cursor: "not-allowed", borderStyle: "dashed", "&:hover": { bgcolor: "transparent" } }}
                                            >
                                                {label}
                                            </Box>
                                        );
                                    }
                                    return (
                                        <Box
                                            key={a.teacher_subject_id}
                                            role="button"
                                            tabIndex={0}
                                            onClick={() => { setExamSubjectId(es.id); setFilter("all"); }}
                                            onKeyDown={(ev) => ev.key === "Enter" && setExamSubjectId(es.id)}
                                            sx={pillSx(es.id === examSubjectId)}
                                        >
                                            {label}
                                        </Box>
                                    );
                                })}
                            </Box>
                            {myAssignments.some((a) => !examSubjects.find((x) => x.teacher_subject_id === a.teacher_subject_id)) && (
                                <Typography sx={{ fontSize: "0.76rem", color: "text.secondary", mt: 1 }}>
                                    Dashed classes are not added to this exam yet. Ask your School Admin to add them under Exams, then Add subject.
                                </Typography>
                            )}
                        </>
                    )}
                </Card>
            )}

            {examId && examSubjects.length === 0 && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    You don't have any of your classes assigned to this exam yet.
                    Ask your School Admin to assign one.
                </Alert>
            )}

            {loadingRoster && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={28} />
                </Box>
            )}

            {!loadingRoster && roster.length > 0 && (
                <>
                    <StatChips
                        active={filter}
                        onPick={(f) => setFilter(f === filter ? "all" : f)}
                        items={[
                            { label: "Students", value: roster.length, filter: "all" },
                            { label: "Entered", value: entered, filter: "entered", tone: "#16A34A" },
                            { label: "Pending", value: pending, filter: "pending", tone: "#D97706" },
                            { label: `Max marks`, value: max }
                        ]}
                    />

                    <Card sx={{ borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)", overflow: "hidden" }}>
                        {shown.length === 0 && (
                            <Typography sx={{ p: 2.5, color: "text.secondary", textAlign: "center", fontSize: "0.9rem" }}>
                                {filter === "pending" ? "Everyone has marks entered." : "No marks entered yet."}
                            </Typography>
                        )}
                        {shown.map((student) => {
                            const bad = isInvalid(student);
                            const pct = student.marks_obtained !== "" && !bad && max > 0
                                ? Math.round((Number(student.marks_obtained) / max) * 100)
                                : null;
                            return (
                                <Box
                                    key={student.student_id}
                                    data-testid="marks-row"
                                    sx={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1.5,
                                        px: 2, py: 1.25,
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
                                                {student.grade_name && ` · Grade ${student.grade_name}`}
                                                {pct !== null && ` · ${pct}%`}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexShrink: 0 }}>
                                        <TextField
                                            type="number"
                                            size="small"
                                            value={student.marks_obtained}
                                            error={bad}
                                            placeholder="-"
                                            onChange={(e) => setStudentMarks(student.student_id, e.target.value)}
                                            sx={{ width: 84, "& input": { textAlign: "center", fontWeight: 800, fontSize: "1rem" } }}
                                            slotProps={{ htmlInput: { min: 0, max: maxMarks, inputMode: "decimal", "aria-label": `Marks for ${student.first_name}` } }}
                                        />
                                        <Typography sx={{ fontSize: "0.82rem", color: bad ? "#DC2626" : "text.secondary", fontWeight: 600 }}>
                                            / {max}
                                        </Typography>
                                    </Box>
                                </Box>
                            );
                        })}
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
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, color: invalidCount ? "#DC2626" : "inherit" }}>
                            {invalidCount
                                ? `${invalidCount} outside 0-${max}`
                                : `${entered} of ${roster.length} entered`}
                        </Typography>
                        <Button
                            loading={saving}
                            loadingPosition="start"
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving}
                            sx={{ whiteSpace: "nowrap", flexShrink: 0 }}
                        >
                            {saving ? "Saving..." : "Save Marks"}
                        </Button>
                    </Box>
                </>
            )}
        </Box>
    );
}

export default EnterMarksPage;
