import { useEffect, useMemo, useState } from "react";

import { notify } from "../../utils/notify";
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Dialog,
    IconButton,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    TextField,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";

import AddIcon from "@mui/icons-material/AddOutlined";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";
import EventIcon from "@mui/icons-material/EventOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ArchiveIcon from "@mui/icons-material/ArchiveOutlined";
import UnarchiveIcon from "@mui/icons-material/UnarchiveOutlined";
import ConfirmDialog from "../../components/common/ConfirmDialog";

import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import StatChips from "../../components/common/StatChips";

import {
    createExam,
    updateExam,
    deleteExam,
    setExamArchived,
    updateExamSubject,
    deleteExamSubject,
    getAllExams,
    assignSubjectToExam,
    getSubjectsByExam,
    getSchoolAssignments
} from "../../services/examService";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function day(value) {
    return value ? String(value).slice(0, 10) : "";
}

function fmt(value) {
    const d = day(value);
    if (!d) return "";
    const [y, m, dd] = d.split("-");
    return `${Number(dd)} ${MONTHS[Number(m) - 1]} ${y}`;
}

function todayLocal() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

function examStatus(exam) {
    const today = todayLocal();
    const s = day(exam.start_date);
    const e = day(exam.end_date);
    if (s && s > today) return { key: "upcoming", label: "Upcoming", bg: "#E0F2FE", fg: "#075985" };
    if (e && e < today) return { key: "completed", label: "Completed", bg: "#E2E8F0", fg: "#475569" };
    return { key: "ongoing", label: "Ongoing", bg: "#DCFCE7", fg: "#166534" };
}

function ExamsPage() {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [exams, setExams] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const [filter, setFilter] = useState("all");
    const [selectedExamId, setSelectedExamId] = useState(null);
    const [examSubjects, setExamSubjects] = useState([]);
    const [loadingSubjects, setLoadingSubjects] = useState(false);

    // New exam dialog
    const [examDialogOpen, setExamDialogOpen] = useState(false);
    const [examName, setExamName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [creatingExam, setCreatingExam] = useState(false);
    const [examError, setExamError] = useState("");
    const [editingExamId, setEditingExamId] = useState(null);

    // Edit marks of a subject inside an exam
    const [editSubj, setEditSubj] = useState(null);
    const [editMax, setEditMax] = useState("");
    const [editPass, setEditPass] = useState("");
    const [editSubjError, setEditSubjError] = useState("");
    const [savingSubj, setSavingSubj] = useState(false);

    // Generic "are you sure?" box
    const [ask, setAsk] = useState(null);
    function runAsk() {
        const a = ask;
        setAsk(null);
        if (a?.run) a.run();
    }

    // Add subject dialog
    const [subjectDialogOpen, setSubjectDialogOpen] = useState(false);
    const [pickClass, setPickClass] = useState("");
    const [teacherSubjectId, setTeacherSubjectId] = useState("");
    const [maxMarks, setMaxMarks] = useState("100");
    const [passMarks, setPassMarks] = useState("35");
    const [assigning, setAssigning] = useState(false);
    const [assignError, setAssignError] = useState("");

    useEffect(() => {
        loadInitial();
    }, []);

    useEffect(() => {
        if (selectedExamId) loadExamSubjects(selectedExamId);
    }, [selectedExamId]);

    async function loadInitial() {
        try {
            const [examsResponse, assignmentsResponse] = await Promise.all([
                getAllExams(true),
                getSchoolAssignments()
            ]);

            if (assignmentsResponse.success) setAssignments(assignmentsResponse.data);

            if (examsResponse.success) {
                setExams(examsResponse.data);
                const firstLive = examsResponse.data.find((x) => x.is_active !== false);
                if (firstLive) setSelectedExamId(firstLive.id);
                loadCounts(examsResponse.data);
            }
        } catch (err) {
            setPageError(err.response?.data?.message || "Unable to load exams.");
        } finally {
            setLoading(false);
        }
    }

    async function loadCounts(list) {
        // subject count per exam, for the small badge on each card
        const entries = await Promise.all(list.map(async (e) => {
            try {
                const r = await getSubjectsByExam(e.id);
                return [e.id, r.success ? r.data.length : 0];
            } catch (err) {
                return [e.id, 0];
            }
        }));
        setCounts(Object.fromEntries(entries));
    }

    async function loadExamSubjects(examId) {
        try {
            setLoadingSubjects(true);
            const response = await getSubjectsByExam(examId);
            if (response.success) {
                setExamSubjects(response.data);
                setCounts((prev) => ({ ...prev, [examId]: response.data.length }));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingSubjects(false);
        }
    }

    function openEditExam(e) {
        setEditingExamId(e.id);
        setExamName(e.exam_name || "");
        setStartDate(day(e.start_date));
        setEndDate(day(e.end_date));
        setExamError("");
        setExamDialogOpen(true);
    }

    function openExamDialog() {
        setEditingExamId(null);
        setExamName("");
        setStartDate("");
        setEndDate("");
        setExamError("");
        setExamDialogOpen(true);
    }

    function handleSaveExamClick() {
        if (!editingExamId) { handleCreateExam(); return; }
        setAsk({ title: "Save changes?", message: "This exam's name and dates will be updated.", confirmLabel: "Yes, save", run: handleCreateExam });
    }

    function pickFilter(f) {
        setFilter(f);
        const list = f === "archived"
            ? exams.filter((x) => x.is_active === false)
            : exams.filter((x) => x.is_active !== false && (f === "all" || examStatus(x).key === f));
        if (list.length && !list.some((x) => x.id === selectedExamId)) setSelectedExamId(list[0].id);
    }

    async function reloadExams(keepId) {
        const r = await getAllExams(true);
        if (r.success) {
            setExams(r.data);
            const live = r.data.filter((x) => x.is_active !== false);
            if (keepId && r.data.some((x) => x.id === keepId)) setSelectedExamId(keepId);
            else setSelectedExamId(live[0]?.id || null);
            if (!live.length) setExamSubjects([]);
        }
    }

    async function handleArchive(exam, archived) {
        try {
            const r = await setExamArchived(exam.id, archived);
            if (r.success) {
                notify(archived ? "Exam archived. It is hidden but its marks are kept." : "Exam restored.");
                if (archived && filter !== "archived") await reloadExams(null);
                else await reloadExams(exam.id);
                if (!archived) setFilter("all");
            } else {
                setPageError(r.message);
            }
        } catch (err) {
            setPageError(err.response?.data?.message || "Unable to update this exam.");
        }
    }

    async function handleDeleteExam(exam) {
        try {
            const r = await deleteExam(exam.id);
            if (r.success) {
                notify("Exam deleted.");
                await reloadExams(null);
            } else {
                setPageError(r.message);
            }
        } catch (err) {
            const msg = err.response?.data?.message || "Unable to delete this exam.";
            if (err.response?.status === 409) {
                setAsk({
                    title: "This exam can't be deleted",
                    message: msg,
                    confirmLabel: "Archive instead",
                    confirmColor: "warning",
                    run: () => handleArchive(exam, true)
                });
            } else {
                setPageError(msg);
            }
        }
    }

    function openEditSubject(es, label) {
        setEditSubj({ id: es.id, label });
        setEditMax(String(es.max_marks));
        setEditPass(String(es.pass_marks));
        setEditSubjError("");
    }

    async function saveEditSubject() {
        if (!editMax || Number(editMax) <= 0 || editPass === "") {
            setEditSubjError("Enter max marks and pass marks.");
            return;
        }
        if (Number(editPass) > Number(editMax)) {
            setEditSubjError("Pass marks cannot be more than max marks.");
            return;
        }
        try {
            setSavingSubj(true);
            const r = await updateExamSubject(editSubj.id, { max_marks: editMax, pass_marks: editPass });
            if (r.success) {
                notify("Marks updated.");
                setEditSubj(null);
                await loadExamSubjects(selectedExamId);
            } else {
                setEditSubjError(r.message);
            }
        } catch (err) {
            setEditSubjError(err.response?.data?.message || "Unable to update the marks.");
        } finally {
            setSavingSubj(false);
        }
    }

    async function handleRemoveSubject(es) {
        try {
            const r = await deleteExamSubject(es.id);
            if (r.success) {
                notify("Subject removed from the exam.");
                await loadExamSubjects(selectedExamId);
            } else {
                setPageError(r.message);
            }
        } catch (err) {
            setPageError(err.response?.data?.message || "Unable to remove this subject.");
        }
    }

    async function handleCreateExam() {
        setExamError("");

        if (!examName.trim() || !startDate || !endDate) {
            setExamError("Please fill in Exam Name, Start Date and End Date.");
            return;
        }

        if (endDate < startDate) {
            setExamError("The end date cannot be before the start date.");
            return;
        }

        try {
            setCreatingExam(true);
            const payload = {
                exam_name: examName.trim(),
                start_date: startDate,
                end_date: endDate,
                academic_year_id: 1
            };
            const response = editingExamId
                ? await updateExam(editingExamId, payload)
                : await createExam(payload);

            if (response.success && editingExamId) {
                setExamDialogOpen(false);
                notify("Exam updated.");
                await reloadExams(editingExamId);
            } else if (response.success) {
                setExamDialogOpen(false);
                notify("Exam created.");
                const examsResponse = await getAllExams(true);
                if (examsResponse.success) {
                    setExams(examsResponse.data);
                    setFilter("all");
                    setSelectedExamId(response.data.id);
                    setCounts((prev) => ({ ...prev, [response.data.id]: 0 }));
                }
            } else {
                setExamError(response.message);
            }
        } catch (err) {
            setExamError(err.response?.data?.message || (editingExamId ? "Unable to update exam." : "Unable to create exam."));
        } finally {
            setCreatingExam(false);
        }
    }

    // class-section groups from the assignment list
    const classOptions = useMemo(() => {
        const map = new Map();
        assignments.forEach((a) => {
            if (a.ended_at) return;
            const key = `${a.class_id}-${a.section_id}`;
            if (!map.has(key)) map.set(key, { key, label: `${a.class_name} - ${a.section_name}` });
        });
        return Array.from(map.values());
    }, [assignments]);

    const usedIds = useMemo(() => new Set(examSubjects.map((x) => x.teacher_subject_id)), [examSubjects]);

    const subjectOptions = useMemo(() => {
        return assignments.filter((a) => !a.ended_at && `${a.class_id}-${a.section_id}` === pickClass && !usedIds.has(a.id));
    }, [assignments, pickClass, usedIds]);

    function openSubjectDialog() {
        setAssignError("");
        setPickClass(classOptions[0]?.key || "");
        setTeacherSubjectId("");
        setMaxMarks("100");
        setPassMarks("35");
        setSubjectDialogOpen(true);
    }

    async function handleAssignSubject() {
        setAssignError("");

        if (!selectedExamId || !teacherSubjectId || !maxMarks || !passMarks) {
            setAssignError("Please choose a class and subject, and fill in the marks.");
            return;
        }

        if (Number(passMarks) > Number(maxMarks)) {
            setAssignError("Pass marks cannot be more than max marks.");
            return;
        }

        try {
            setAssigning(true);
            const response = await assignSubjectToExam({
                exam_id: selectedExamId,
                teacher_subject_id: teacherSubjectId,
                max_marks: maxMarks,
                pass_marks: passMarks
            });

            if (response.success) {
                await loadExamSubjects(selectedExamId);
                setSubjectDialogOpen(false);
                notify("Subject added to the exam.");
            } else {
                setAssignError(response.message);
            }
        } catch (err) {
            setAssignError(err.response?.data?.message || "Unable to assign subject.");
        } finally {
            setAssigning(false);
        }
    }

    const withStatusAll = useMemo(() => exams.map((e) => ({ ...e, status: examStatus(e), archived: e.is_active === false })), [exams]);
    const withStatus = useMemo(() => withStatusAll.filter((e) => !e.archived), [withStatusAll]);
    const archivedExams = useMemo(() => withStatusAll.filter((e) => e.archived), [withStatusAll]);

    const stats = useMemo(() => {
        const n = (k) => withStatus.filter((e) => e.status.key === k).length;
        return [
            { label: "Total exams", value: withStatus.length, filter: "all" },
            { label: "Ongoing", value: n("ongoing"), filter: "ongoing", tone: "#166534" },
            { label: "Upcoming", value: n("upcoming"), filter: "upcoming", tone: "#075985" },
            { label: "Completed", value: n("completed"), filter: "completed", tone: "#475569" },
            ...(archivedExams.length ? [{ label: "Archived", value: archivedExams.length, filter: "archived", tone: "#92400E" }] : [])
        ];
    }, [withStatus, archivedExams]);

    const visible = filter === "archived"
        ? archivedExams
        : withStatus.filter((e) => filter === "all" || e.status.key === filter);

    const selected = withStatusAll.find((e) => e.id === selectedExamId);

    // subjects grouped by class - section
    const grouped = useMemo(() => {
        const groups = new Map();
        examSubjects.forEach((es) => {
            const a = assignments.find((x) => x.id === es.teacher_subject_id);
            const key = a ? `${a.class_name} - ${a.section_name}` : "Other";
            if (!groups.has(key)) groups.set(key, []);
            groups.get(key).push({ es, a });
        });
        return Array.from(groups.entries());
    }, [examSubjects, assignments]);

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (

        <Box sx={{ maxWidth: 1100 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: "var(--sl-soft, #EDE9FE)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AssessmentIcon sx={{ color: "var(--sl-accent, #7C3AED)" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Exams</Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                        Create exams and choose which class subjects are tested
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openExamDialog}>
                    New exam
                </Button>
            </Box>

            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

            <StatChips items={stats} active={filter} onPick={pickFilter} />

            {exams.length === 0 ? (

                <Card sx={{ p: 4, textAlign: "center" }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No exams yet</Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Create your first exam, then add the class subjects to it.
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openExamDialog}>New exam</Button>
                </Card>

            ) : (

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "340px 1fr" }, gap: 2, alignItems: "start" }}>

                    {/* ---------- exam list ---------- */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

                        {visible.length === 0 && (
                            <Card sx={{ p: 2.5, textAlign: "center", color: "text.secondary" }}>No exams in this view.</Card>
                        )}

                        {visible.map((e) => (
                            <Box
                                key={e.id}
                                data-testid="exam-card"
                                onClick={() => setSelectedExamId(e.id)}
                                sx={{
                                    cursor: "pointer",
                                    p: 1.75,
                                    borderRadius: 3,
                                    bgcolor: "#fff",
                                    border: "1px solid var(--sl-border, #E2E8F0)",
                                    boxShadow: "var(--sl-card-shadow, none)",
                                    outline: e.id === selectedExamId ? "2px solid var(--sl-accent, #4F46E5)" : "none"
                                }}
                            >
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                                    <Typography sx={{ fontWeight: 800, flex: 1, minWidth: 0 }} noWrap>{e.exam_name}</Typography>
                                    <Chip size="small" label={e.status.label} sx={{ bgcolor: e.status.bg, color: e.status.fg, fontWeight: 700 }} />
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
                                    <EventIcon sx={{ fontSize: 16 }} />
                                    <Typography sx={{ fontSize: "0.82rem" }}>
                                        {fmt(e.start_date)} - {fmt(e.end_date)}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.5 }}>
                                    {counts[e.id] === undefined ? "..." : counts[e.id]} subject{counts[e.id] === 1 ? "" : "s"} added
                                </Typography>
                            </Box>
                        ))}

                    </Box>

                    {/* ---------- selected exam ---------- */}
                    <Card sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>

                        {selected && (
                            <>
                                <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                                    <Box sx={{ flex: 1, minWidth: 180 }}>
                                        <Typography sx={{ fontWeight: 800, fontSize: "1.15rem" }}>{selected.exam_name}</Typography>
                                        <Typography sx={{ fontSize: "0.84rem", color: "text.secondary" }}>
                                            {fmt(selected.start_date)} - {fmt(selected.end_date)}
                                            {" · "}{examSubjects.length} subject{examSubjects.length === 1 ? "" : "s"}
                                            {" · "}{grouped.length} class section{grouped.length === 1 ? "" : "s"}
                                        </Typography>
                                    </Box>
                                    <Button variant="outlined" startIcon={<AddIcon />} onClick={openSubjectDialog} disabled={assignments.length === 0 || selected.archived}>
                                        Add subject
                                    </Button>
                                </Box>

                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                                    <Chip clickable aria-label="Edit exam" icon={<EditIcon sx={{ fontSize: 16 }} />} label="Edit" onClick={() => openEditExam(selected)}
                                        sx={{ border: "1.5px solid var(--sl-ink, #111827)", bgcolor: "transparent", fontWeight: 700 }} />
                                    {selected.archived ? (
                                        <Chip clickable aria-label="Restore exam" icon={<UnarchiveIcon sx={{ fontSize: 16 }} />} label="Restore"
                                            onClick={() => setAsk({ title: "Restore this exam?", message: `${selected.exam_name} will show again for admins and teachers.`, confirmLabel: "Yes, restore", run: () => handleArchive(selected, false) })}
                                            sx={{ border: "1.5px solid var(--sl-ink, #111827)", bgcolor: "transparent", fontWeight: 700 }} />
                                    ) : (
                                        <Chip clickable aria-label="Archive exam" icon={<ArchiveIcon sx={{ fontSize: 16 }} />} label="Archive"
                                            onClick={() => setAsk({ title: "Archive this exam?", message: `${selected.exam_name} will be hidden from the list and from teachers. Marks and report cards are kept, and you can restore it any time.`, confirmLabel: "Yes, archive", confirmColor: "warning", run: () => handleArchive(selected, true) })}
                                            sx={{ border: "1.5px solid var(--sl-ink, #111827)", bgcolor: "transparent", fontWeight: 700 }} />
                                    )}
                                    <Chip clickable aria-label="Delete exam" icon={<DeleteOutlineIcon sx={{ fontSize: 16, color: "#DC2626 !important" }} />} label="Delete"
                                        onClick={() => setAsk({ title: "Delete this exam?", message: `${selected.exam_name} and its subject list will be removed. This only works if no marks are entered yet.`, confirmLabel: "Yes, delete", confirmColor: "error", run: () => handleDeleteExam(selected) })}
                                        sx={{ border: "1.5px solid #DC2626", bgcolor: "transparent", fontWeight: 700, color: "#DC2626" }} />
                                </Box>

                                {selected.archived && (
                                    <Alert severity="warning" sx={{ mb: 1.5 }}>
                                        This exam is archived. It is hidden from teachers, and marks can't be changed. Marks and report cards are kept. Use Restore to bring it back.
                                    </Alert>
                                )}

                                {assignments.length === 0 && (
                                    <Alert severity="info" sx={{ mb: 1.5 }}>
                                        Assign teachers to classes and subjects first (Teachers → Assign), then add them here.
                                    </Alert>
                                )}

                                {loadingSubjects && (
                                    <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                                        <CircularProgress size={24} />
                                    </Box>
                                )}

                                {!loadingSubjects && examSubjects.length === 0 && (
                                    <Box sx={{ p: 2.5, borderRadius: 2.5, bgcolor: "var(--sl-page2, #F8FAFC)", textAlign: "center", color: "text.secondary" }}>
                                        No subjects added yet. Tap "Add subject" to choose the class subjects for this exam.
                                    </Box>
                                )}

                                {!loadingSubjects && grouped.map(([label, items]) => (
                                    <Box key={label} sx={{ mb: 1.75 }}>
                                        <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.4, color: "text.secondary", mb: 0.75 }}>
                                            {label.toUpperCase()} ({items.length})
                                        </Typography>
                                        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                                            {items.map(({ es, a }) => (
                                                <Box
                                                    key={es.id}
                                                    data-testid="exam-subject"
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 1,
                                                        flexWrap: "wrap",
                                                        px: 1.5,
                                                        py: 1,
                                                        borderRadius: 2.5,
                                                        border: "1px solid var(--sl-border, #E2E8F0)",
                                                        bgcolor: "var(--sl-page2, #F8FAFC)"
                                                    }}
                                                >
                                                    <Box sx={{ flex: 1, minWidth: 130 }}>
                                                        <Typography sx={{ fontWeight: 700, fontSize: "0.92rem" }}>
                                                            {a ? a.subject_name : `Teacher-Subject #${es.teacher_subject_id}`}
                                                        </Typography>
                                                        {a && (a.first_name || a.last_name) && (
                                                            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                                                                {a.first_name} {a.last_name}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                    <Chip size="small" label={`Max ${es.max_marks}`} />
                                                    <Chip size="small" label={`Pass ${es.pass_marks}`} sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 600 }} />
                                                    {!selected.archived && (
                                                        <>
                                                            <IconButton size="small" aria-label="Edit marks" onClick={() => openEditSubject(es, a ? a.subject_name : "Subject")}>
                                                                <EditIcon fontSize="small" />
                                                            </IconButton>
                                                            <IconButton size="small" aria-label="Remove subject"
                                                                onClick={() => setAsk({
                                                                    title: "Remove this subject?",
                                                                    message: `${a ? a.subject_name : "This subject"} will be taken out of ${selected.exam_name}. Only possible while no marks are entered.`,
                                                                    confirmLabel: "Yes, remove",
                                                                    confirmColor: "error",
                                                                    run: () => handleRemoveSubject(es)
                                                                })}>
                                                                <DeleteOutlineIcon fontSize="small" sx={{ color: "#DC2626" }} />
                                                            </IconButton>
                                                        </>
                                                    )}
                                                </Box>
                                            ))}
                                        </Box>
                                    </Box>
                                ))}
                            </>
                        )}

                    </Card>

                </Box>

            )}

            {/* ---------- New exam dialog ---------- */}
            <Dialog open={examDialogOpen} onClose={() => setExamDialogOpen(false)} fullWidth maxWidth="xs" fullScreen={fullScreen}>
                <DialogTitle sx={{ fontWeight: 800 }}>{editingExamId ? "Edit exam" : "New exam"}</DialogTitle>
                <DialogContent>
                    {examError && <Alert severity="error" sx={{ mb: 2 }}>{examError}</Alert>}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        <TextField
                            label="Exam name"
                            placeholder="e.g. Mid Term 2026"
                            value={examName}
                            onChange={(e) => setExamName(e.target.value)}
                            fullWidth
                            autoFocus
                        />
                        <SchoolDatePicker label="Start date" value={startDate} onChange={setStartDate} fullWidth />
                        <SchoolDatePicker label="End date" value={endDate} onChange={setEndDate} fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2 }}>
                    <Button onClick={() => setExamDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveExamClick} disabled={creatingExam}>
                        {creatingExam ? "Saving..." : editingExamId ? "Save changes" : "Create exam"}
                    </Button>
                </DialogActions>
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

            {/* ---------- Edit marks dialog ---------- */}
            <Dialog open={!!editSubj} onClose={() => !savingSubj && setEditSubj(null)} fullWidth maxWidth="xs" fullScreen={fullScreen}>
                <DialogTitle sx={{ fontWeight: 800 }}>
                    Edit marks
                    {editSubj && <Typography sx={{ fontSize: "0.82rem", color: "text.secondary", fontWeight: 500 }}>{editSubj.label}</Typography>}
                </DialogTitle>
                <DialogContent>
                    {editSubjError && <Alert severity="error" sx={{ mb: 2 }}>{editSubjError}</Alert>}
                    <Box sx={{ display: "flex", gap: 2, pt: 1 }}>
                        <TextField label="Max marks" type="number" value={editMax} onChange={(e) => setEditMax(e.target.value)} fullWidth />
                        <TextField label="Pass marks" type="number" value={editPass} onChange={(e) => setEditPass(e.target.value)} fullWidth />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2 }}>
                    <Button onClick={() => setEditSubj(null)} disabled={savingSubj}>Cancel</Button>
                    <Button variant="contained" onClick={() => setAsk({ title: "Save changes?", message: "The max and pass marks for this subject will be updated.", confirmLabel: "Yes, save", run: saveEditSubject })} disabled={savingSubj}>
                        {savingSubj ? "Saving..." : "Save changes"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ---------- Add subject dialog ---------- */}
            <Dialog open={subjectDialogOpen} onClose={() => setSubjectDialogOpen(false)} fullWidth maxWidth="xs" fullScreen={fullScreen}>
                <DialogTitle sx={{ fontWeight: 800 }}>
                    Add subject
                    {selected && <Typography sx={{ fontSize: "0.82rem", color: "text.secondary", fontWeight: 500 }}>{selected.exam_name}</Typography>}
                </DialogTitle>
                <DialogContent>
                    {assignError && <Alert severity="error" sx={{ mb: 2 }}>{assignError}</Alert>}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        <TextField
                            select
                            label="Class"
                            value={pickClass}
                            onChange={(e) => { setPickClass(e.target.value); setTeacherSubjectId(""); }}
                            fullWidth
                        >
                            {classOptions.map((c) => (
                                <MenuItem key={c.key} value={c.key}>{c.label}</MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Subject"
                            value={teacherSubjectId}
                            onChange={(e) => setTeacherSubjectId(e.target.value)}
                            fullWidth
                            helperText={subjectOptions.length === 0 ? "All subjects of this class are already added." : ""}
                        >
                            {subjectOptions.map((a) => (
                                <MenuItem key={a.id} value={a.id}>
                                    {a.subject_name}{a.first_name ? ` · ${a.first_name} ${a.last_name || ""}` : ""}
                                </MenuItem>
                            ))}
                        </TextField>

                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField label="Max marks" type="number" value={maxMarks} onChange={(e) => setMaxMarks(e.target.value)} fullWidth />
                            <TextField label="Pass marks" type="number" value={passMarks} onChange={(e) => setPassMarks(e.target.value)} fullWidth />
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2 }}>
                    <Button onClick={() => setSubjectDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleAssignSubject} disabled={assigning}>
                        {assigning ? "Adding..." : "Add subject"}
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>

    );

}

export default ExamsPage;
