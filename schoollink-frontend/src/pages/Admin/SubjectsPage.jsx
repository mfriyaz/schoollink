import { useEffect, useState } from "react";

import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
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
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";

import ConfirmDialog from "../../components/common/ConfirmDialog";

import {
    getAllSubjectsForManagement,
    createSubjectRecord,
    updateSubjectRecord,
    deactivateSubjectRecord,
    reactivateSubjectRecord
} from "../../services/subjectManagementService";

const emptyForm = { subject_name: "", subject_code: "" };

function SubjectsPage() {

    const [subjects, setSubjects] = useState([]);

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

    if (loading) {

        return (

            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                <CircularProgress />

            </Box>

        );

    }

    return (

        <Box sx={{ maxWidth: 800 }}>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>

                    Subjects

                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                >

                    Add Subject

                </Button>

            </Box>

            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

            {subjects.length === 0 && (

                <Typography color="text.secondary">

                    No subjects added yet.

                </Typography>

            )}

            {subjects.map((subject) => (

                <Card key={subject.id} sx={{ p: 2.5, mb: 2 }}>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                            <Avatar sx={{ bgcolor: subject.is_active ? "#DBEAFE" : "#F1F5F9" }}>

                                <MenuBookIcon sx={{ color: subject.is_active ? "#2563EB" : "#94A3B8" }} fontSize="small" />

                            </Avatar>

                            <Box>

                                <Typography sx={{ fontWeight: 600 }}>

                                    {subject.subject_name}

                                </Typography>

                                {subject.subject_code && (

                                    <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>

                                        Code: {subject.subject_code}

                                    </Typography>

                                )}

                            </Box>

                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>

                            <Chip
                                size="small"
                                color={subject.is_active ? "success" : "default"}
                                label={subject.is_active ? "Active" : "Inactive"}
                            />

                            <Button
                                size="small"
                                startIcon={<EditIcon fontSize="small" />}
                                onClick={() => openEditDialog(subject)}
                            >

                                Edit

                            </Button>

                            {subject.is_active ? (

                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={<BlockIcon fontSize="small" />}
                                    onClick={() => handleToggleRequest(subject)}
                                >

                                    Deactivate

                                </Button>

                            ) : (

                                <Button
                                    size="small"
                                    color="success"
                                    startIcon={<RestoreIcon fontSize="small" />}
                                    onClick={() => handleToggleRequest(subject)}
                                >

                                    Reactivate

                                </Button>

                            )}

                        </Box>

                    </Box>

                </Card>

            ))}

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

                    <Button variant="contained" onClick={handleSave} disabled={saving}>

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
