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
import SearchIcon from "@mui/icons-material/SearchRounded";
import StarIcon from "@mui/icons-material/StarRounded";
import MoreVertIcon from "@mui/icons-material/MoreVertRounded";
import StatChips from "../../components/common/StatChips";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { notify } from "../../utils/notify";
import { getStudents } from "../../services/studentService";
import { getSchoolAssignments } from "../../services/teacherSubjectService";
import ClassIcon from "@mui/icons-material/ClassOutlined";

import {
    getAllClassesForManagement,
    createClassRecord,
    updateClassRecord,
    deactivateClassRecord,
    reactivateClassRecord,
    getAllSectionsForClass,
    createSectionRecord,
    updateSectionRecord,
    deactivateSectionRecord,
    reactivateSectionRecord
} from "../../services/classManagementService";

function ClassesPage() {

    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);

    const [pageError, setPageError] = useState("");

    const [sectionsByClass, setSectionsByClass] = useState({});

    const [students, setStudents] = useState([]);

    const [assignments, setAssignments] = useState([]);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("all");

    const [menu, setMenu] = useState(null);

    // Class dialog
    const [classDialogOpen, setClassDialogOpen] = useState(false);

    const [editingClass, setEditingClass] = useState(null);
    const [ask, setAsk] = useState(null);
    function runAsk() {
        const a = ask;
        setAsk(null);
        if (a?.run) a.run();
    }

    const [classForm, setClassForm] = useState({ class_name: "", class_order: "" });

    const [classFormError, setClassFormError] = useState("");

    const [savingClass, setSavingClass] = useState(false);

    // Section dialog
    const [sectionDialogOpen, setSectionDialogOpen] = useState(false);

    const [editingSection, setEditingSection] = useState(null);

    const [sectionClassId, setSectionClassId] = useState(null);

    const [sectionForm, setSectionForm] = useState({ section_name: "", capacity: "40" });

    const [sectionFormError, setSectionFormError] = useState("");

    const [savingSection, setSavingSection] = useState(false);

    useEffect(() => {

        loadClasses();

        loadExtras();

    }, []);

    async function loadClasses() {

        try {

            const response = await getAllClassesForManagement();

            if (response.success) {

                setClasses(response.data);

                response.data.forEach((c) => loadSections(c.id));

            }

        } catch (err) {

            setPageError(
                err.response?.data?.message ||
                "Unable to load classes."
            );

        } finally {

            setLoading(false);

        }

    }

    async function loadExtras() {

        try {
            const r = await getStudents();
            if (r.success) setStudents(r.data);
        } catch (err) { /* counts stay at 0 */ }

        try {
            const r = await getSchoolAssignments();
            if (r.success) setAssignments(r.data);
        } catch (err) { /* teacher info stays empty */ }

    }

    async function loadSections(classId) {

        try {

            const response = await getAllSectionsForClass(classId);

            if (response.success) {

                setSectionsByClass((prev) => ({ ...prev, [classId]: response.data }));

            }

        } catch (err) {

            console.error(err);

        }

    }

    // --- Class actions ---

    function openCreateClass() {

        setEditingClass(null);

        setClassForm({ class_name: "", class_order: "" });

        setClassFormError("");

        setClassDialogOpen(true);

    }

    function openEditClass(classItem) {

        setEditingClass(classItem);

        setClassForm({

            class_name: classItem.class_name,

            class_order: classItem.class_order

        });

        setClassFormError("");

        setClassDialogOpen(true);

    }

    function handleSaveClass() {
        if (!editingClass) { doSaveClass(); return; }
        setAsk({ title: "Save changes?", message: "This class will be updated.", confirmLabel: "Yes, save", run: doSaveClass });
    }

    async function doSaveClass() {

        setClassFormError("");

        if (!classForm.class_name || !classForm.class_order) {

            setClassFormError("Class Name and Order are required.");

            return;

        }

        try {

            setSavingClass(true);

            const response = editingClass

                ? await updateClassRecord(editingClass.id, classForm)

                : await createClassRecord({ ...classForm, academic_year_id: 1 });

            if (response.success) {

                setClassDialogOpen(false);

                notify(editingClass ? "Class updated." : "Class added.");

                await loadClasses();

            } else {

                setClassFormError(response.message);

            }

        } catch (err) {

            setClassFormError(
                err.response?.data?.message ||
                "Unable to save this class."
            );

        } finally {

            setSavingClass(false);

        }

    }

    async function handleToggleClass(classItem) {

        setPageError("");

        try {

            const response = classItem.is_active

                ? await deactivateClassRecord(classItem.id)

                : await reactivateClassRecord(classItem.id);

            if (response.success) {

                notify(classItem.is_active ? "Class deactivated." : "Class reactivated.");

                await loadClasses();

            } else {

                setPageError(response.message);

            }

        } catch (err) {

            setPageError(
                err.response?.data?.message ||
                "Unable to update this class."
            );

        }

    }

    // --- Section actions ---

    function openCreateSection(classId) {

        setEditingSection(null);

        setSectionClassId(classId);

        setSectionForm({ section_name: "", capacity: "40" });

        setSectionFormError("");

        setSectionDialogOpen(true);

    }

    function openEditSection(classId, section) {

        setEditingSection(section);

        setSectionClassId(classId);

        setSectionForm({

            section_name: section.section_name,

            capacity: section.capacity

        });

        setSectionFormError("");

        setSectionDialogOpen(true);

    }

    function handleSaveSection() {
        if (!editingSection) { doSaveSection(); return; }
        setAsk({ title: "Save changes?", message: "This section will be updated.", confirmLabel: "Yes, save", run: doSaveSection });
    }

    async function doSaveSection() {

        setSectionFormError("");

        if (!sectionForm.section_name) {

            setSectionFormError("Section Name is required.");

            return;

        }

        try {

            setSavingSection(true);

            const response = editingSection

                ? await updateSectionRecord(editingSection.id, sectionForm)

                : await createSectionRecord({ ...sectionForm, class_id: sectionClassId });

            if (response.success) {

                setSectionDialogOpen(false);

                notify(editingSection ? "Section updated." : "Section added.");

                await loadSections(sectionClassId);

            } else {

                setSectionFormError(response.message);

            }

        } catch (err) {

            setSectionFormError(
                err.response?.data?.message ||
                "Unable to save this section."
            );

        } finally {

            setSavingSection(false);

        }

    }

    async function handleToggleSection(classId, section) {

        setPageError("");

        try {

            const response = section.is_active

                ? await deactivateSectionRecord(section.id)

                : await reactivateSectionRecord(section.id);

            if (response.success) {

                notify(section.is_active ? "Section deactivated." : "Section reactivated.");

                await loadSections(classId);

            } else {

                setPageError(response.message);

            }

        } catch (err) {

            setPageError(
                err.response?.data?.message ||
                "Unable to update this section."
            );

        }

    }

    const studentCount = {};
    students.forEach((st) => {
        if (st.is_active === false) return;
        studentCount[st.section_id] = (studentCount[st.section_id] || 0) + 1;
    });

    const classTeacher = {};
    assignments.forEach((a) => {
        if (a.is_class_teacher) classTeacher[`${a.class_id}-${a.section_id}`] = `${a.first_name} ${a.last_name || ""}`.trim();
    });

    const allSections = classes.flatMap((c) => (sectionsByClass[c.id] || []).map((s) => ({ ...s, _class: c })));
    const activeSections = allSections.filter((s) => s.is_active && s._class.is_active);

    const stats = {
        classes: classes.filter((c) => c.is_active).length,
        sections: activeSections.length,
        students: students.filter((st) => st.is_active !== false).length,
        noTeacher: activeSections.filter((s) => !classTeacher[`${s._class.id}-${s.id}`]).length
    };

    const q = search.trim().toLowerCase();

    const visibleClasses = classes.filter((c) => {
        const secs = sectionsByClass[c.id] || [];
        if (filter === "active" && !c.is_active) return false;
        if (filter === "inactive" && c.is_active) return false;
        if (filter === "noteacher" && !secs.some((s) => s.is_active && !classTeacher[`${c.id}-${s.id}`])) return false;
        if (!q) return true;
        return c.class_name.toLowerCase().includes(q) || secs.some((s) => `section ${s.section_name}`.toLowerCase().includes(q));
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

            {/* ---------- Header ---------- */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1.5, flexWrap: "wrap" }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Classes</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {stats.classes} classes - {stats.sections} sections - {stats.students} students
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateClass}>
                    Add Class
                </Button>
            </Box>

            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

            <StatChips
                active={filter}
                onPick={setFilter}
                items={[
                    { label: "Classes", value: stats.classes, filter: "all" },
                    { label: "Sections", value: stats.sections },
                    { label: "Students", value: stats.students },
                    { label: "No class teacher", value: stats.noTeacher, filter: "noteacher", tone: stats.noTeacher ? "#B45309" : undefined }
                ]}
            />

            <Box sx={{ display: "flex", gap: 1.25, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search class or section"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: "1 1 240px", maxWidth: 380 }}
                    slotProps={{
                        input: { startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.75, color: "text.secondary" }} /> }
                    }}
                />
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    {[["all", "All"], ["active", "Active"], ["inactive", "Inactive"], ["noteacher", "No class teacher"]].map(([id, label]) => (
                        <Chip
                            key={id}
                            label={label}
                            size="small"
                            onClick={() => setFilter(id)}
                            sx={{
                                fontWeight: 600,
                                bgcolor: filter === id ? "var(--sl-ink, #0F172A)" : "var(--sl-soft, #F1F5F9)",
                                color: filter === id ? "#fff" : "var(--sl-ink, #0F172A)",
                                "&:hover": { bgcolor: filter === id ? "var(--sl-ink, #0F172A)" : "var(--sl-soft2, #E2E8F0)" }
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {classes.length === 0 && <Typography color="text.secondary">No classes added yet.</Typography>}
            {classes.length > 0 && visibleClasses.length === 0 && <Typography color="text.secondary">No classes match.</Typography>}

            {/* ---------- Class cards ---------- */}
            {visibleClasses.map((classItem) => {

                const secs = sectionsByClass[classItem.id];
                const list = secs || [];
                const classStudents = list.reduce((n, s) => n + (studentCount[s.id] || 0), 0);
                const teacherIds = new Set(assignments.filter((a) => a.class_id === classItem.id).map((a) => a.teacher_id));

                return (
                    <Card
                        key={classItem.id}
                        data-testid="class-card"
                        sx={{
                            p: { xs: 1.75, md: 2.25 },
                            mb: 1.5,
                            borderRadius: 3,
                            border: "1px solid var(--sl-border, #EEF2F7)",
                            boxShadow: "var(--sl-card-shadow, 0 1px 3px rgba(15,23,42,.06))",
                            opacity: classItem.is_active ? 1 : 0.72
                        }}
                    >

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                            <Box
                                sx={{
                                    width: 44, height: 44, borderRadius: 2.5, display: "flex", alignItems: "center", justifyContent: "center",
                                    bgcolor: classItem.is_active ? "var(--sl-soft, #E0E7FF)" : "#F1F5F9",
                                    color: classItem.is_active ? "var(--sl-ink, #4F46E5)" : "#94A3B8"
                                }}
                            >
                                <ClassIcon />
                            </Box>

                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.2 }} noWrap>{classItem.class_name}</Typography>
                                <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
                                    {secs ? `${list.length} ${list.length === 1 ? "section" : "sections"} - ${classStudents} students - ${teacherIds.size} ${teacherIds.size === 1 ? "teacher" : "teachers"}` : "Loading..."}
                                </Typography>
                            </Box>

                            <Chip
                                size="small"
                                label={classItem.is_active ? "Active" : "Inactive"}
                                sx={{
                                    fontWeight: 700,
                                    bgcolor: classItem.is_active ? "#DCFCE7" : "#F1F5F9",
                                    color: classItem.is_active ? "#15803D" : "#64748B"
                                }}
                            />

                            <IconButton size="small" aria-label="Edit class" onClick={() => openEditClass(classItem)}>
                                <EditIcon fontSize="small" />
                            </IconButton>

                            <IconButton size="small" aria-label="More class actions" onClick={(e) => setMenu({ anchor: e.currentTarget, kind: "class", classItem })}>
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 1.25 }}>

                            {list.map((section) => {

                                const n = studentCount[section.id] || 0;
                                const cap = Number(section.capacity) || 0;
                                const pct = cap ? Math.min(100, Math.round((n / cap) * 100)) : 0;
                                const full = cap && n >= cap;
                                const near = cap && n / cap >= 0.9;
                                const bar = full ? "#DC2626" : near ? "#F59E0B" : "#16A34A";
                                const ct = classTeacher[`${classItem.id}-${section.id}`];
                                const subjectCount = new Set(
                                    assignments.filter((a) => a.class_id === classItem.id && a.section_id === section.id).map((a) => a.subject_id)
                                ).size;

                                return (
                                    <Box
                                        key={section.id}
                                        data-testid="section-tile"
                                        sx={{
                                            p: 1.5,
                                            borderRadius: 2.5,
                                            border: "1px solid var(--sl-border, #E2E8F0)",
                                            bgcolor: "var(--sl-page2, #F8FAFC)",
                                            opacity: section.is_active ? 1 : 0.6
                                        }}
                                    >
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                            <Typography sx={{ fontWeight: 700, flex: 1 }}>Section {section.section_name}</Typography>
                                            {!section.is_active && <Chip size="small" label="Inactive" />}
                                            <IconButton size="small" aria-label="Edit section" onClick={() => openEditSection(classItem.id, section)}>
                                                <EditIcon sx={{ fontSize: 17 }} />
                                            </IconButton>
                                            <IconButton size="small" aria-label="More section actions" onClick={(e) => setMenu({ anchor: e.currentTarget, kind: "section", classItem, section })}>
                                                <MoreVertIcon sx={{ fontSize: 18 }} />
                                            </IconButton>
                                        </Box>

                                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5, mb: 0.4 }}>
                                            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>Students</Typography>
                                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700 }}>{n}{cap ? ` / ${cap}` : ""}</Typography>
                                        </Box>
                                        <Box sx={{ height: 6, borderRadius: 3, bgcolor: "#E2E8F0", overflow: "hidden" }}>
                                            <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: bar }} />
                                        </Box>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1, minHeight: 22 }}>
                                            {ct ? (
                                                <>
                                                    <StarIcon sx={{ fontSize: 16, color: "#B45309" }} />
                                                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }} noWrap>{ct}</Typography>
                                                </>
                                            ) : (
                                                <Typography sx={{ fontSize: "0.8rem", color: "#B45309" }}>No class teacher</Typography>
                                            )}
                                        </Box>
                                        <Typography sx={{ fontSize: "0.76rem", color: "text.secondary", mt: 0.25 }}>
                                            {subjectCount} {subjectCount === 1 ? "subject" : "subjects"} assigned
                                        </Typography>
                                    </Box>
                                );
                            })}

                            <Box
                                onClick={() => openCreateSection(classItem.id)}
                                sx={{
                                    p: 1.5, borderRadius: 2.5, border: "1.5px dashed var(--sl-border, #CBD5E1)", cursor: "pointer",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5, minHeight: 64,
                                    color: "text.secondary", fontWeight: 600, fontSize: "0.88rem",
                                    "&:hover": { bgcolor: "var(--sl-soft, #F1F5F9)" }
                                }}
                            >
                                <AddIcon fontSize="small" /> Add section
                            </Box>

                        </Box>

                    </Card>
                );
            })}

            <ConfirmDialog
                open={!!ask}
                title={ask?.title || ""}
                message={ask?.message || ""}
                confirmLabel={ask?.confirmLabel || "Proceed"}
                confirmColor={ask?.confirmColor || "primary"}
                onConfirm={runAsk}
                onCancel={() => setAsk(null)}
            />

            <Menu anchorEl={menu ? menu.anchor : null} open={!!menu} onClose={() => setMenu(null)}>
                {menu && menu.kind === "class" && menu.classItem.is_active && (
                    <MenuItem sx={{ color: "error.main" }} onClick={() => { const c = menu.classItem; setMenu(null); setAsk({ title: "Deactivate this class?", message: `${c.class_name} will be marked inactive. Existing records are kept.`, confirmLabel: "Yes, deactivate", confirmColor: "error", run: () => handleToggleClass(c) }); }}>Deactivate class</MenuItem>
                )}
                {menu && menu.kind === "class" && !menu.classItem.is_active && (
                    <MenuItem sx={{ color: "success.main" }} onClick={() => { const c = menu.classItem; setMenu(null); setAsk({ title: "Reactivate this class?", message: `${c.class_name} will be active again.`, confirmLabel: "Yes, reactivate", run: () => handleToggleClass(c) }); }}>Reactivate class</MenuItem>
                )}
                {menu && menu.kind === "section" && menu.section.is_active && (
                    <MenuItem sx={{ color: "error.main" }} onClick={() => { const m = menu; setMenu(null); setAsk({ title: "Deactivate this section?", message: `${m.classItem.class_name}-${m.section.section_name} will be marked inactive. Existing records are kept.`, confirmLabel: "Yes, deactivate", confirmColor: "error", run: () => handleToggleSection(m.classItem.id, m.section) }); }}>Deactivate section</MenuItem>
                )}
                {menu && menu.kind === "section" && !menu.section.is_active && (
                    <MenuItem sx={{ color: "success.main" }} onClick={() => { const m = menu; setMenu(null); setAsk({ title: "Reactivate this section?", message: `${m.classItem.class_name}-${m.section.section_name} will be active again.`, confirmLabel: "Yes, reactivate", run: () => handleToggleSection(m.classItem.id, m.section) }); }}>Reactivate section</MenuItem>
                )}
            </Menu>

            <Dialog open={classDialogOpen} onClose={() => setClassDialogOpen(false)} maxWidth="xs" fullWidth>

                <DialogTitle sx={{ fontWeight: 700 }}>

                    {editingClass ? "Edit Class" : "Add Class"}

                </DialogTitle>

                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

                    {classFormError && <Alert severity="error">{classFormError}</Alert>}

                    <TextField
                        label="Class Name"
                        placeholder="e.g. Grade 7"
                        value={classForm.class_name}
                        onChange={(e) => setClassForm({ ...classForm, class_name: e.target.value })}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Order"
                        type="number"
                        placeholder="e.g. 7"
                        value={classForm.class_order}
                        onChange={(e) => setClassForm({ ...classForm, class_order: e.target.value })}
                        fullWidth
                        size="small"
                        helperText="Controls display order (lower numbers first)"
                    />

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>

                    <Button onClick={() => setClassDialogOpen(false)}>Cancel</Button>

                    <Button loading={savingClass} loadingPosition="start" variant="contained" onClick={handleSaveClass} disabled={savingClass}>

                        {savingClass ? "Saving..." : "Save"}

                    </Button>

                </DialogActions>

            </Dialog>

            <Dialog open={sectionDialogOpen} onClose={() => setSectionDialogOpen(false)} maxWidth="xs" fullWidth>

                <DialogTitle sx={{ fontWeight: 700 }}>

                    {editingSection ? "Edit Section" : "Add Section"}

                </DialogTitle>

                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

                    {sectionFormError && <Alert severity="error">{sectionFormError}</Alert>}

                    <TextField
                        label="Section Name"
                        placeholder="e.g. A"
                        value={sectionForm.section_name}
                        onChange={(e) => setSectionForm({ ...sectionForm, section_name: e.target.value })}
                        fullWidth
                        size="small"
                    />

                    <TextField
                        label="Capacity"
                        type="number"
                        value={sectionForm.capacity}
                        onChange={(e) => setSectionForm({ ...sectionForm, capacity: e.target.value })}
                        fullWidth
                        size="small"
                    />

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>

                    <Button onClick={() => setSectionDialogOpen(false)}>Cancel</Button>

                    <Button loading={savingSection} loadingPosition="start" variant="contained" onClick={handleSaveSection} disabled={savingSection}>

                        {savingSection ? "Saving..." : "Save"}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    );

}

export default ClassesPage;
