import { useEffect, useState } from "react";
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
    DialogTitle,
    IconButton,
    Menu,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/AddOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import RestoreIcon from "@mui/icons-material/RestoreOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlineRounded";
import StarIcon from "@mui/icons-material/StarRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import MoreVertIcon from "@mui/icons-material/MoreVertRounded";
import StatChips from "../../components/common/StatChips";
import { getSchoolAssignments } from "../../services/teacherSubjectService";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import {
    getAllSubjectsForManagement,
    createSubjectRecord,
    updateSubjectRecord,
    deactivateSubjectRecord,
    reactivateSubjectRecord
} from "../../services/subjectManagementService";
const emptyForm = { subject_name: "", subject_code: "" };

const PALETTE = [
    ["#DCFCE7", "#16A34A"], ["#CCFBF1", "#0D9488"], ["#FEF3C7", "#D97706"], ["#FCE7F3", "#DB2777"],
    ["#FFEDD5", "#EA580C"], ["#CFFAFE", "#0891B2"], ["#EDE9FE", "#7C3AED"], ["#FEE2E2", "#DC2626"]
];
const colorFor = (id) => PALETTE[Math.abs(Number(id) || 0) % PALETTE.length];

function ClassView({ subjects, assignments, ready, classKey, setClassKey, search, setSearch }) {
    // Classes come from the assignments (a class with no assignment yet has nothing to show)
    const classes = [];
    const seen = new Set();
    assignments.forEach((a) => {
        if (!seen.has(a.class_id)) { seen.add(a.class_id); classes.push({ id: a.class_id, name: a.class_name }); }
    });
    classes.sort((x, y) => String(x.name).localeCompare(String(y.name), undefined, { numeric: true }));
    const activeId = classes.find((c) => String(c.id) === String(classKey))?.id ?? classes[0]?.id;

    const q = search.trim().toLowerCase();
    const inClass = assignments.filter((a) => a.class_id === activeId);
    const sections = [];
    const secSeen = new Set();
    inClass.forEach((a) => {
        if (!secSeen.has(a.section_id)) { secSeen.add(a.section_id); sections.push({ id: a.section_id, name: a.section_name }); }
    });
    sections.sort((x, y) => String(x.name).localeCompare(String(y.name), undefined, { numeric: true }));
    const activeSubjects = subjects.filter((x) => x.is_active);
    const years = new Set(assignments.map((a) => a.year_name).filter(Boolean));
    const showYear = years.size > 1;

    if (!ready) {
        return <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><CircularProgress size={28} /></Box>;
    }
    if (classes.length === 0) {
        return (
            <Box sx={{ py: 5, textAlign: "center", bgcolor: "#fff", border: "1.5px dashed var(--sl-ink)", borderRadius: 3 }}>
                <SchoolIcon sx={{ fontSize: 36, color: "var(--sl-ink)" }} />
                <Typography color="text.secondary">No subjects are assigned to any class yet.</Typography>
            </Box>
        );
    }
    return (
        <>
            <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1, mb: 1.5, mx: { xs: -0.5, md: 0 }, px: { xs: 0.5, md: 0 } }}>
                {classes.map((c) => (
                    <Box
                        key={c.id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={c.id === activeId}
                        onClick={() => setClassKey(String(c.id))}
                        sx={{
                            flexShrink: 0, px: 1.75, py: 0.65, borderRadius: 99, cursor: "pointer", userSelect: "none",
                            fontSize: "0.88rem", fontWeight: 800, color: "var(--sl-ink)", border: "1.5px solid var(--sl-ink)",
                            bgcolor: c.id === activeId ? "var(--sl-accent)" : "transparent",
                            boxShadow: c.id === activeId ? "2px 2px 0 var(--sl-ink)" : "none",
                            "&:hover": { bgcolor: c.id === activeId ? undefined : "var(--sl-soft)" }
                        }}
                    >
                        {c.name}
                    </Box>
                ))}
            </Box>
            <TextField
                size="small"
                placeholder="Search subject or teacher"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{ width: "100%", maxWidth: 420, mb: 2 }}
                slotProps={{ input: { startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.75, color: "text.secondary" }} /> } }}
            />
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 1.5 }}>
                {sections.map((sec) => {
                    const rows = inClass.filter((a) => a.section_id === sec.id);
                    const classTeacher = rows.find((a) => a.is_class_teacher);
                    const taught = new Set(rows.map((a) => a.subject_id));
                    const missing = activeSubjects.filter((x) => !taught.has(x.id));
                    const teacherCount = {};
                    rows.forEach((a) => { teacherCount[a.subject_id] = (teacherCount[a.subject_id] || 0) + 1; });
                    const doubled = Object.values(teacherCount).filter((n) => n > 1).length;
                    const shown = rows
                        .filter((a) => !q || `${a.subject_name} ${a.first_name} ${a.last_name || ""}`.toLowerCase().includes(q))
                        .sort((x, y) => String(x.subject_name).localeCompare(String(y.subject_name)));
                    return (
                        <Card
                            key={sec.id}
                            data-testid="section-card"
                            sx={{ p: { xs: 1.75, md: 2.25 }, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                                <Box sx={{ width: 44, height: 44, borderRadius: "13px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "var(--sl-ink)" }}>
                                    {sec.name}
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography sx={{ fontWeight: 800, color: "var(--sl-ink)", lineHeight: 1.25 }} noWrap>
                                        {classes.find((c) => c.id === activeId)?.name} - {sec.name}
                                    </Typography>
                                    <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }} noWrap>
                                        {taught.size} subject{taught.size === 1 ? "" : "s"}
                                        {doubled > 0 ? ` - ${doubled} with 2+ teachers` : ""}
                                    </Typography>
                                </Box>
                            </Box>
                            {classTeacher && (
                                <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.25, py: 0.35, mb: 1.5, borderRadius: 99, bgcolor: "#FEF3C7", border: "1.5px solid var(--sl-ink)", fontSize: "0.78rem", fontWeight: 800, color: "var(--sl-ink)" }}>
                                    <StarIcon sx={{ fontSize: 15, color: "#D97706" }} />
                                    Class teacher: {classTeacher.first_name} {classTeacher.last_name || ""}
                                </Box>
                            )}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75 }}>
                                {shown.length === 0 && (
                                    <Typography color="text.secondary" sx={{ fontSize: "0.85rem" }}>No subjects match.</Typography>
                                )}
                                {shown.map((a) => {
                                    const [bg, fg] = colorFor(a.subject_id);
                                    return (
                                        <Box
                                            key={a.id}
                                            data-testid="class-subject-row"
                                            sx={{ display: "flex", alignItems: "center", gap: 1.25, p: 1, borderRadius: 2.5, border: "1px solid var(--sl-border)", bgcolor: "#fff" }}
                                        >
                                            <Box sx={{ width: 34, height: 34, minWidth: 34, borderRadius: "10px", bgcolor: bg, border: "1.5px solid var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                <MenuBookIcon sx={{ color: fg, fontSize: 18 }} />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 800, color: "var(--sl-ink)", minWidth: 0 }} noWrap>
                                                {a.subject_name}
                                            </Typography>
                                                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5, mt: 0.25 }}>
                                            {teacherCount[a.subject_id] > 1 && (
                                                <Box component="span" data-testid="multi-teacher" sx={{ px: 1, py: 0.1, borderRadius: 99, fontSize: "0.7rem", fontWeight: 800, bgcolor: "#FFEDD5", color: "#C2410C", border: "1.5px solid #EA580C", whiteSpace: "nowrap" }}>
                                                    {teacherCount[a.subject_id]} teachers
                                                </Box>
                                            )}
                                            {showYear && a.year_name && (
                                                <Box component="span" sx={{ px: 1, py: 0.1, borderRadius: 99, fontSize: "0.68rem", fontWeight: 700, bgcolor: "var(--sl-soft)", color: "var(--sl-ink)", border: "1px solid var(--sl-border)", whiteSpace: "nowrap" }}>
                                                    {a.year_name}
                                                </Box>
                                            )}
                                                </Box>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.4, color: "text.secondary", fontSize: "0.82rem", minWidth: 0 }}>
                                                <PersonIcon sx={{ fontSize: 16 }} />
                                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {a.first_name} {a.last_name || ""}
                                                </span>
                                            </Box>
                                        </Box>
                                    );
                                })}
                            </Box>
                            {missing.length > 0 && !q && (
                                <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 2.5, border: "1.5px dashed var(--sl-ink)", bgcolor: "var(--sl-soft)" }}>
                                    <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.4, color: "var(--sl-ink)", mb: 0.5 }}>
                                        NOT ASSIGNED IN THIS SECTION
                                    </Typography>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                                        {missing.map((x) => (
                                            <Chip key={x.id} size="small" label={x.subject_name} sx={{ fontWeight: 700, bgcolor: "#fff", border: "1px solid var(--sl-border)" }} />
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </Card>
                    );
                })}
            </Box>
        </>
    );
}
function SubjectsPage() {
    const [subjects, setSubjects] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [assignmentsReady, setAssignmentsReady] = useState(false);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState("all");
    const [view, setView] = useState("subject");
    const [classKey, setClassKey] = useState("");
    const [menu, setMenu] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmTarget, setConfirmTarget] = useState(null);
    useEffect(() => {
        loadSubjects();
        getSchoolAssignments()
            .then((r) => { if (r.success) setAssignments(r.data); })
            .catch(() => { /* chips stay empty */ })
            .finally(() => setAssignmentsReady(true));
    }, []);
    async function loadSubjects() {
        try {
            const response = await getAllSubjectsForManagement();
            if (response.success) {
                setSubjects(response.data);
            }
        } catch (err) {
            setPageError(
                err.response?.data?.message ||
                "Unable to load subjects."
            );
        } finally {
            setLoading(false);
        }
    }
    function openCreateDialog() {
        setEditingId(null);
        setForm(emptyForm);
        setFormError("");
        setDialogOpen(true);
    }
    function openEditDialog(subject) {
        setEditingId(subject.id);
        setForm({
            subject_name: subject.subject_name || "",
            subject_code: subject.subject_code || ""
        });
        setFormError("");
        setDialogOpen(true);
    }
    async function handleSave() {
        setFormError("");
        if (!form.subject_name) {
            setFormError("Subject Name is required.");
            return;
        }
        try {
            setSaving(true);
            const response = editingId
                ? await updateSubjectRecord(editingId, form)
                : await createSubjectRecord(form);
            if (response.success) {
                setDialogOpen(false);
                await loadSubjects();
            } else {
                setFormError(response.message);
            }
        } catch (err) {
            setFormError(
                err.response?.data?.message ||
                "Unable to save this subject."
            );
        } finally {
            setSaving(false);
        }
    }
    function handleToggleRequest(subject) {
        setConfirmTarget(subject);
        setConfirmOpen(true);
    }
    async function handleConfirmToggle() {
        const subject = confirmTarget;
        setConfirmOpen(false);
        if (!subject) {
            return;
        }
        setPageError("");
        try {
            const response = subject.is_active
                ? await deactivateSubjectRecord(subject.id)
                : await reactivateSubjectRecord(subject.id);
            if (response.success) {
                await loadSubjects();
            } else {
                setPageError(response.message);
            }
        } catch (err) {
            setPageError(
                err.response?.data?.message ||
                "Unable to update this subject."
            );
        }
    }
    const bySubject = {};
    assignments.forEach((a) => {
        (bySubject[a.subject_id] = bySubject[a.subject_id] || []).push(a);
    });
    const stats = {
        total: subjects.length,
        active: subjects.filter((x) => x.is_active).length,
        inUse: subjects.filter((x) => (bySubject[x.id] || []).length).length,
        unused: assignmentsReady ? subjects.filter((x) => x.is_active && !(bySubject[x.id] || []).length).length : 0
    };
    const q = search.trim().toLowerCase();
    const visibleSubjects = subjects.filter((x) => {
        const mine = bySubject[x.id] || [];
        if (filter === "active" && !x.is_active) return false;
        if (filter === "inactive" && x.is_active) return false;
        if (filter === "inuse" && !mine.length) return false;
        if (filter === "unused" && (!x.is_active || mine.length)) return false;
        if (!q) return true;
        const hay = [x.subject_name, x.subject_code, ...mine.flatMap((a) => [a.first_name, a.last_name, a.class_name])].join(" ").toLowerCase();
        return hay.includes(q);
    });
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }
    return (
        <Box sx={{ maxWidth: 1100 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1.5, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ width: 46, height: 46, minWidth: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <MenuBookIcon sx={{ color: "var(--sl-ink)" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>Subjects</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                            {stats.total} subjects - {stats.active} active
                        </Typography>
                    </Box>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
                    Add Subject
                </Button>
            </Box>
            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}
            <Box sx={{ display: "inline-flex", p: 0.5, mb: 2, borderRadius: 99, border: "1.5px solid var(--sl-ink)", bgcolor: "#fff", gap: 0.5 }}>
                {[["subject", "By subject", <MenuBookIcon key="s" sx={{ fontSize: 17 }} />], ["class", "By class", <SchoolIcon key="c" sx={{ fontSize: 17 }} />]].map(([id, label, icon]) => (
                    <Box
                        key={id}
                        role="button"
                        tabIndex={0}
                        aria-pressed={view === id}
                        onClick={() => setView(id)}
                        sx={{
                            display: "flex", alignItems: "center", gap: 0.75, px: 1.75, py: 0.6, borderRadius: 99,
                            cursor: "pointer", userSelect: "none", fontSize: "0.85rem", fontWeight: 800, color: "var(--sl-ink)",
                            bgcolor: view === id ? "var(--sl-accent)" : "transparent",
                            "&:hover": { bgcolor: view === id ? undefined : "var(--sl-soft)" }
                        }}
                    >
                        {icon}
                        {label}
                    </Box>
                ))}
            </Box>
            {view === "class" && (
                <ClassView
                    subjects={subjects}
                    assignments={assignments}
                    ready={assignmentsReady}
                    classKey={classKey}
                    setClassKey={setClassKey}
                    search={search}
                    setSearch={setSearch}
                />
            )}
            {view === "subject" && (<>
            <StatChips
                active={filter}
                onPick={setFilter}
                items={[
                    { label: "Total", value: stats.total, filter: "all" },
                    { label: "Active", value: stats.active, filter: "active", tone: "#16A34A" },
                    { label: "Being taught", value: stats.inUse, filter: "inuse" },
                    { label: "Not assigned", value: stats.unused, filter: "unused", tone: stats.unused ? "#B45309" : undefined }
                ]}
            />
            <Box sx={{ display: "flex", gap: 1.25, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search subject, code, teacher or class"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: "1 1 260px", maxWidth: 420 }}
                    slotProps={{
                        input: { startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.75, color: "text.secondary" }} /> }
                    }}
                />
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    {[["all", "All"], ["active", "Active"], ["inactive", "Inactive"], ["inuse", "Being taught"], ["unused", "Not assigned"]].map(([id, label]) => (
                        <Box
                            key={id}
                            role="button"
                            tabIndex={0}
                            onClick={() => setFilter(id)}
                            sx={{
                                px: 1.5, py: 0.55, borderRadius: 99, cursor: "pointer", userSelect: "none",
                                fontSize: "0.82rem", fontWeight: 700, color: "var(--sl-ink)",
                                border: "1.5px solid var(--sl-ink)",
                                bgcolor: filter === id ? "var(--sl-accent)" : "transparent",
                                "&:hover": { bgcolor: filter === id ? undefined : "var(--sl-soft)" }
                            }}
                        >
                            {label}
                        </Box>
                    ))}
                </Box>
            </Box>
            {subjects.length === 0 && <Typography color="text.secondary">No subjects added yet.</Typography>}
            {subjects.length > 0 && visibleSubjects.length === 0 && <Typography color="text.secondary">No subjects match.</Typography>}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 1.5 }}>
                {visibleSubjects.map((subject) => {
                    const mine = bySubject[subject.id] || [];
                    const teachers = [...new Set(mine.map((a) => `${a.first_name} ${a.last_name || ""}`.trim()))];
                    const classNames = [...new Set(mine.map((a) => a.class_name))];
                    const shown = mine.slice(0, 6);
                    return (
                        <Card
                            key={subject.id}
                            data-testid="subject-card"
                            sx={{
                                p: { xs: 1.75, md: 2.25 },
                                borderRadius: 3,
                                border: "1px solid var(--sl-border, #EEF2F7)",
                                boxShadow: "var(--sl-card-shadow, 0 1px 3px rgba(15,23,42,.06))",
                                opacity: subject.is_active ? 1 : 0.72,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.25
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Box
                                    sx={{
                                        width: 44, height: 44, borderRadius: 2.5, display: "flex", alignItems: "center", justifyContent: "center",
                                        bgcolor: subject.is_active ? "var(--sl-soft, #E0E7FF)" : "#F1F5F9",
                                        color: subject.is_active ? "var(--sl-ink, #4F46E5)" : "#94A3B8"
                                    }}
                                >
                                    <MenuBookIcon />
                                </Box>
                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap>{subject.subject_name}</Typography>
                                    <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }} noWrap>
                                        {subject.subject_code ? `Code ${subject.subject_code} - ` : ""}
                                        {mine.length ? `${mine.length} class ${mine.length === 1 ? "section" : "sections"}` : "Not assigned yet"}
                                    </Typography>
                                </Box>
                                <Chip
                                    size="small"
                                    label={subject.is_active ? "Active" : "Inactive"}
                                    sx={{
                                        fontWeight: 700,
                                        bgcolor: subject.is_active ? "#DCFCE7" : "#F1F5F9",
                                        color: subject.is_active ? "#15803D" : "#64748B"
                                    }}
                                />
                                <IconButton size="small" aria-label="Edit subject" onClick={() => openEditDialog(subject)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                                <IconButton size="small" aria-label="More subject actions" onClick={(e) => setMenu({ anchor: e.currentTarget, subject })}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </Box>
                            <Box
                                sx={{
                                    p: 1.25,
                                    borderRadius: 2,
                                    bgcolor: "var(--sl-page2, #F8FAFC)",
                                    border: "1px solid var(--sl-border, #EEF2F7)"
                                }}
                            >
                                {mine.length === 0 ? (
                                    <Typography sx={{ fontSize: "0.84rem", color: assignmentsReady ? "#B45309" : "text.secondary" }}>
                                        {assignmentsReady ? "No teacher teaches this subject yet. Assign it from the Teachers page." : "Loading..."}
                                    </Typography>
                                ) : (
                                    <>
                                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", mb: 0.75, letterSpacing: 0.3 }}>
                                            TAUGHT IN {classNames.length} {classNames.length === 1 ? "CLASS" : "CLASSES"} BY {teachers.length} {teachers.length === 1 ? "TEACHER" : "TEACHERS"}
                                        </Typography>
                                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                                            {shown.map((a) => (
                                                <Chip
                                                    key={a.id}
                                                    size="small"
                                                    label={`${a.class_name}-${a.section_name} - ${a.first_name}`}
                                                    sx={{ bgcolor: "#fff", border: "1px solid var(--sl-border, #E2E8F0)" }}
                                                />
                                            ))}
                                            {mine.length > shown.length && <Chip size="small" label={`+${mine.length - shown.length} more`} />}
                                        </Box>
                                    </>
                                )}
                            </Box>
                        </Card>
                    );
                })}
            </Box>
            </>)}
            <Menu anchorEl={menu ? menu.anchor : null} open={!!menu} onClose={() => setMenu(null)}>
                {menu && menu.subject.is_active && (
                    <MenuItem sx={{ color: "error.main" }} onClick={() => { const s = menu.subject; setMenu(null); handleToggleRequest(s); }}>Deactivate</MenuItem>
                )}
                {menu && !menu.subject.is_active && (
                    <MenuItem sx={{ color: "success.main" }} onClick={() => { const s = menu.subject; setMenu(null); handleToggleRequest(s); }}>Reactivate</MenuItem>
                )}
            </Menu>
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontWeight: 700 }}>
                    {editingId ? "Edit Subject" : "Add Subject"}
                </DialogTitle>
                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                    {formError && <Alert severity="error">{formError}</Alert>}
                    <TextField
                        label="Subject Name"
                        placeholder="e.g. Mathematics"
                        value={form.subject_name}
                        onChange={(e) => setForm({ ...form, subject_name: e.target.value })}
                        fullWidth
                        size="small"
                    />
                    <TextField
                        label="Subject Code (optional)"
                        placeholder="e.g. MATH101"
                        value={form.subject_code}
                        onChange={(e) => setForm({ ...form, subject_code: e.target.value })}
                        fullWidth
                        size="small"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 3 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button loading={saving} loadingPosition="start" variant="contained" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
                    </Button>
                </DialogActions>
            </Dialog>
            <ConfirmDialog
                open={confirmOpen}
                title={confirmTarget?.is_active ? "Deactivate Subject" : "Reactivate Subject"}
                message={
                    confirmTarget?.is_active
                        ? `Deactivate ${confirmTarget?.subject_name}? It will no longer be available for new class assignments, but existing records are kept.`
                        : `Reactivate ${confirmTarget?.subject_name}?`
                }
                confirmLabel={confirmTarget?.is_active ? "Deactivate" : "Reactivate"}
                confirmColor={confirmTarget?.is_active ? "error" : "success"}
                onConfirm={handleConfirmToggle}
                onCancel={() => setConfirmOpen(false)}
            />
        </Box>
    );
}
export default SubjectsPage;
