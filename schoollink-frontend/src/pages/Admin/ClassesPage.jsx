import { useEffect, useState } from "react";

import {
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/AddOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import RestoreIcon from "@mui/icons-material/RestoreOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMoreOutlined";
import ClassIcon from "@mui/icons-material/ClassOutlined";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoomOutlined";

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

function SectionRow({ section, onEdit, onToggle }) {

    return (

        <Box

            sx={{

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                flexWrap: "wrap",

                gap: 1,

                py: 1,

                borderBottom: "1px solid #F1F5F9",

                "&:last-of-type": { borderBottom: "none" }

            }}

        >

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

                <MeetingRoomIcon sx={{ color: section.is_active ? "#2563EB" : "#94A3B8" }} fontSize="small" />

                <Typography sx={{ fontWeight: 500 }}>

                    Section {section.section_name}

                </Typography>

                <Typography sx={{ color: "#64748B", fontSize: "0.8rem" }}>

                    (capacity {section.capacity})

                </Typography>

            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                <Chip
                    size="small"
                    color={section.is_active ? "success" : "default"}
                    label={section.is_active ? "Active" : "Inactive"}
                />

                <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => onEdit(section)}>

                    Edit

                </Button>

                {section.is_active ? (

                    <Button size="small" color="error" startIcon={<BlockIcon fontSize="small" />} onClick={() => onToggle(section)}>

                        Deactivate

                    </Button>

                ) : (

                    <Button size="small" color="success" startIcon={<RestoreIcon fontSize="small" />} onClick={() => onToggle(section)}>

                        Reactivate

                    </Button>

                )}

            </Box>

        </Box>

    );

}

function ClassesPage() {

    const [classes, setClasses] = useState([]);

    const [loading, setLoading] = useState(true);

    const [pageError, setPageError] = useState("");

    const [sectionsByClass, setSectionsByClass] = useState({});

    // Class dialog
    const [classDialogOpen, setClassDialogOpen] = useState(false);

    const [editingClass, setEditingClass] = useState(null);

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

    }, []);

    async function loadClasses() {

        try {

            const response = await getAllClassesForManagement();

            if (response.success) {

                setClasses(response.data);

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

    function handleAccordionChange(classId) {

        return (event, expanded) => {

            if (expanded && !sectionsByClass[classId]) {

                loadSections(classId);

            }

        };

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

    async function handleSaveClass() {

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

    async function handleSaveSection() {

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

    if (loading) {

        return (

            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                <CircularProgress />

            </Box>

        );

    }

    return (

        <Box sx={{ maxWidth: 900 }}>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>

                    Classes

                </Typography>

                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateClass}>

                    Add Class

                </Button>

            </Box>

            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

            {classes.length === 0 && (

                <Typography color="text.secondary">

                    No classes added yet.

                </Typography>

            )}

            {classes.map((classItem) => (

                <Accordion key={classItem.id} onChange={handleAccordionChange(classItem.id)} sx={{ mb: 1.5, borderRadius: 2, "&:before": { display: "none" } }}>

                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1, width: "100%", pr: 2 }}>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

                                <ClassIcon sx={{ color: classItem.is_active ? "#2563EB" : "#94A3B8" }} />

                                <Typography sx={{ fontWeight: 600 }}>

                                    {classItem.class_name}

                                </Typography>

                                <Chip
                                    size="small"
                                    color={classItem.is_active ? "success" : "default"}
                                    label={classItem.is_active ? "Active" : "Inactive"}
                                />

                            </Box>

                            <Box sx={{ display: "flex", gap: 1 }} onClick={(e) => e.stopPropagation()}>

                                <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => openEditClass(classItem)}>

                                    Edit

                                </Button>

                                {classItem.is_active ? (

                                    <Button size="small" color="error" startIcon={<BlockIcon fontSize="small" />} onClick={() => handleToggleClass(classItem)}>

                                        Deactivate

                                    </Button>

                                ) : (

                                    <Button size="small" color="success" startIcon={<RestoreIcon fontSize="small" />} onClick={() => handleToggleClass(classItem)}>

                                        Reactivate

                                    </Button>

                                )}

                            </Box>

                        </Box>

                    </AccordionSummary>

                    <AccordionDetails>

                        {(sectionsByClass[classItem.id] || []).map((section) => (

                            <SectionRow
                                key={section.id}
                                section={section}
                                onEdit={(s) => openEditSection(classItem.id, s)}
                                onToggle={(s) => handleToggleSection(classItem.id, s)}
                            />

                        ))}

                        {sectionsByClass[classItem.id] && sectionsByClass[classItem.id].length === 0 && (

                            <Typography color="text.secondary" sx={{ mb: 1 }}>

                                No sections yet.

                            </Typography>

                        )}

                        <Button
                            size="small"
                            startIcon={<AddIcon fontSize="small" />}
                            onClick={() => openCreateSection(classItem.id)}
                            sx={{ mt: 1 }}
                        >

                            Add Section

                        </Button>

                    </AccordionDetails>

                </Accordion>

            ))}

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

                    <Button variant="contained" onClick={handleSaveClass} disabled={savingClass}>

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

                    <Button variant="contained" onClick={handleSaveSection} disabled={savingSection}>

                        {savingSection ? "Saving..." : "Save"}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    );

}

export default ClassesPage;
