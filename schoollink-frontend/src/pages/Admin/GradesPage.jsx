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
    Grid,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/AddOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GradeIcon from "@mui/icons-material/GradeOutlined";

import {
    getAllGrades,
    createGrade,
    updateGrade,
    deleteGrade
} from "../../services/gradeManagementService";

const emptyForm = {

    grade_name: "",

    minimum_percentage: "",

    maximum_percentage: "",

    grade_point: "",

    result: "Pass"

};

function GradesPage() {

    const [grades, setGrades] = useState([]);

    const [loading, setLoading] = useState(true);

    const [pageError, setPageError] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [formError, setFormError] = useState("");

    const [saving, setSaving] = useState(false);

    useEffect(() => {

        loadGrades();

    }, []);

    async function loadGrades() {

        try {

            setLoading(true);

            setPageError("");

            const response = await getAllGrades();

            if (response.success) {

                setGrades(response.data);

            } else {

                setPageError(response.message);

            }

        } catch (err) {

            setPageError(

                err.response?.data?.message ||
                "Unable to load the grading scale."

            );

        } finally {

            setLoading(false);

        }

    }

    function openAddDialog() {

        setEditingId(null);

        setForm(emptyForm);

        setFormError("");

        setDialogOpen(true);

    }

    function openEditDialog(grade) {

        setEditingId(grade.id);

        setForm({

            grade_name: grade.grade_name,

            minimum_percentage: grade.minimum_percentage,

            maximum_percentage: grade.maximum_percentage,

            grade_point: grade.grade_point || "",

            result: grade.result || "Pass"

        });

        setFormError("");

        setDialogOpen(true);

    }

    async function handleSave() {

        setFormError("");

        if (!form.grade_name || form.minimum_percentage === "" || form.maximum_percentage === "") {

            setFormError("Grade name, minimum, and maximum percentage are required.");

            return;

        }

        if (Number(form.minimum_percentage) > Number(form.maximum_percentage)) {

            setFormError("Minimum percentage can't be greater than maximum percentage.");

            return;

        }

        try {

            setSaving(true);

            const response = editingId

                ? await updateGrade(editingId, form)

                : await createGrade(form);

            if (response.success) {

                setDialogOpen(false);

                await loadGrades();

            } else {

                setFormError(response.message);

            }

        } catch (err) {

            setFormError(

                err.response?.data?.message ||
                "Unable to save this grade band."

            );

        } finally {

            setSaving(false);

        }

    }

    async function handleDelete(id) {

        if (!window.confirm("Delete this grade band? This can't be undone.")) {

            return;

        }

        try {

            const response = await deleteGrade(id);

            if (response.success) {

                await loadGrades();

            } else {

                setPageError(response.message);

            }

        } catch (err) {

            setPageError(

                err.response?.data?.message ||
                "Unable to delete this grade band."

            );

        }

    }

    return (

        <Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>

                <Box

                    sx={{

                        width: 44,

                        height: 44,

                        borderRadius: 2,

                        bgcolor: "#EDE9FE",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center"

                    }}

                >

                    <GradeIcon sx={{ color: "#7C3AED" }} />

                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700, flex: 1 }}>

                    Grading Scale

                </Typography>

                <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>

                    Add Grade

                </Button>

            </Box>

            <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 3 }}>

                Define the percentage bands used to calculate a student's grade when marks are entered - e.g. 91-100% = A1.

            </Typography>

            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

            {loading && (

                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                    <CircularProgress />

                </Box>

            )}

            {!loading && grades.length === 0 && (

                <Card sx={{ p: 4, textAlign: "center" }}>

                    <Typography sx={{ color: "#94A3B8" }}>

                        No grade bands configured yet. Add one to get started.

                    </Typography>

                </Card>

            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

                {!loading && grades.map((grade) => (

                    <Card key={grade.id} sx={{ p: 2.5 }}>

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>

                                <Typography sx={{ fontWeight: 700, fontSize: "1.1rem", minWidth: 50 }}>

                                    {grade.grade_name}

                                </Typography>

                                <Typography sx={{ color: "#64748B" }}>

                                    {Number(grade.minimum_percentage)}% - {Number(grade.maximum_percentage)}%

                                </Typography>

                                {grade.grade_point !== null && (

                                    <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>

                                        Point: {grade.grade_point}

                                    </Typography>

                                )}

                                <Chip

                                    size="small"

                                    color={grade.result === "Pass" ? "success" : "error"}

                                    label={grade.result}

                                />

                            </Box>

                            <Box sx={{ display: "flex", gap: 1 }}>

                                <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => openEditDialog(grade)}>

                                    Edit

                                </Button>

                                <Button size="small" color="error" startIcon={<DeleteOutlineIcon fontSize="small" />} onClick={() => handleDelete(grade.id)}>

                                    Delete

                                </Button>

                            </Box>

                        </Box>

                    </Card>

                ))}

            </Box>

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth>

                <DialogTitle>

                    {editingId ? "Edit Grade" : "Add Grade"}

                </DialogTitle>

                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

                    {formError && <Alert severity="error">{formError}</Alert>}

                    <TextField

                        label="Grade Name (e.g. A1)"

                        size="small"

                        fullWidth

                        value={form.grade_name}

                        onChange={(e) => setForm({ ...form, grade_name: e.target.value })}

                    />

                    <Grid container spacing={2}>

                        <Grid size={{ xs: 6 }}>

                            <TextField

                                label="Min %"

                                type="number"

                                size="small"

                                fullWidth

                                value={form.minimum_percentage}

                                onChange={(e) => setForm({ ...form, minimum_percentage: e.target.value })}

                            />

                        </Grid>

                        <Grid size={{ xs: 6 }}>

                            <TextField

                                label="Max %"

                                type="number"

                                size="small"

                                fullWidth

                                value={form.maximum_percentage}

                                onChange={(e) => setForm({ ...form, maximum_percentage: e.target.value })}

                            />

                        </Grid>

                    </Grid>

                    <TextField

                        label="Grade Point (optional)"

                        type="number"

                        size="small"

                        fullWidth

                        value={form.grade_point}

                        onChange={(e) => setForm({ ...form, grade_point: e.target.value })}

                    />

                    <TextField

                        select

                        label="Result"

                        size="small"

                        fullWidth

                        value={form.result}

                        onChange={(e) => setForm({ ...form, result: e.target.value })}

                    >

                        <MenuItem value="Pass">Pass</MenuItem>

                        <MenuItem value="Fail">Fail</MenuItem>

                    </TextField>

                </DialogContent>

                <DialogActions>

                    <Button onClick={() => setDialogOpen(false)}>

                        Cancel

                    </Button>

                    <Button variant="contained" onClick={handleSave} disabled={saving}>

                        {saving ? "Saving..." : "Save"}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    );

}

export default GradesPage;
