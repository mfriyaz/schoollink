import { useEffect, useMemo, useState } from "react";

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
    MenuItem,
    TextField,
    Tooltip,
    Typography,
    useMediaQuery,
    useTheme
} from "@mui/material";

import AddIcon from "@mui/icons-material/AddOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import GradeIcon from "@mui/icons-material/GradeOutlined";

import StatChips from "../../components/common/StatChips";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { notify } from "../../utils/notify";

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

// soft colours for the scale bar, best grade (top) to lowest
const PASS_COLOURS = ["#16A34A", "#22C55E", "#65A30D", "#CA8A04", "#EA580C", "#F59E0B"];
const FAIL_COLOUR = "#DC2626";

function GradesPage() {

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

    const [grades, setGrades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pageError, setPageError] = useState("");

    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [formError, setFormError] = useState("");
    const [saving, setSaving] = useState(false);

    const [deleting, setDeleting] = useState(null);
    const [ask, setAsk] = useState(null);
    function runAsk() {
        const a = ask;
        setAsk(null);
        if (a?.run) a.run();
    }


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
            setPageError(err.response?.data?.message || "Unable to load the grading scale.");
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
            grade_point: grade.grade_point === null || grade.grade_point === undefined ? "" : grade.grade_point,
            result: grade.result || "Pass"
        });
        setFormError("");
        setDialogOpen(true);
    }

    function handleSaveClick() {
        if (!editingId) { handleSave(); return; }
        setAsk({ title: "Save changes?", message: "This grade band will be updated.", confirmLabel: "Yes, save", run: handleSave });
    }

    async function handleSave() {
        setFormError("");

        if (!form.grade_name.trim() || form.minimum_percentage === "" || form.maximum_percentage === "") {
            setFormError("Grade name, minimum, and maximum percentage are required.");
            return;
        }

        if (Number(form.minimum_percentage) > Number(form.maximum_percentage)) {
            setFormError("Minimum percentage can't be greater than maximum percentage.");
            return;
        }

        if (Number(form.minimum_percentage) < 0 || Number(form.maximum_percentage) > 100) {
            setFormError("Percentages must be between 0 and 100.");
            return;
        }

        try {
            setSaving(true);
            const payload = {
                ...form,
                grade_name: form.grade_name.trim(),
                grade_point: form.grade_point === "" ? null : form.grade_point
            };
            const response = editingId
                ? await updateGrade(editingId, payload)
                : await createGrade(payload);

            if (response.success) {
                setDialogOpen(false);
                notify(editingId ? "Grade band updated." : "Grade band added.");
                await loadGrades();
            } else {
                setFormError(response.message);
            }
        } catch (err) {
            setFormError(err.response?.data?.message || "Unable to save this grade band.");
        } finally {
            setSaving(false);
        }
    }

    async function confirmDelete() {
        const grade = deleting;
        setDeleting(null);
        if (!grade) return;
        try {
            const response = await deleteGrade(grade.id);
            if (response.success) {
                notify("Grade band deleted.");
                await loadGrades();
            } else {
                setPageError(response.message);
            }
        } catch (err) {
            setPageError(err.response?.data?.message || "Unable to delete this grade band.");
        }
    }

    // best grade first
    const sorted = useMemo(
        () => [...grades].sort((a, b) => Number(b.maximum_percentage) - Number(a.maximum_percentage) || Number(b.minimum_percentage) - Number(a.minimum_percentage)),
        [grades]
    );

    const colourFor = (g, index) => (g.result === "Fail" ? FAIL_COLOUR : PASS_COLOURS[index % PASS_COLOURS.length]);

    // gaps and overlaps in the 0-100 coverage
    const problems = useMemo(() => {
        if (sorted.length === 0) return [];
        const list = [];
        const asc = [...sorted].reverse();
        if (Number(asc[0].minimum_percentage) > 0) {
            list.push(`0% to ${Number(asc[0].minimum_percentage)}% has no grade.`);
        }
        for (let i = 0; i < asc.length - 1; i++) {
            const curMax = Number(asc[i].maximum_percentage);
            const nextMin = Number(asc[i + 1].minimum_percentage);
            if (nextMin > curMax + 1) {
                list.push(`${curMax}% to ${nextMin}% has no grade (between ${asc[i].grade_name} and ${asc[i + 1].grade_name}).`);
            } else if (nextMin <= curMax) {
                list.push(`${asc[i].grade_name} and ${asc[i + 1].grade_name} overlap.`);
            }
        }
        const top = Number(asc[asc.length - 1].maximum_percentage);
        if (top < 100) list.push(`${top}% to 100% has no grade.`);
        return list;
    }, [sorted]);

    const stats = [
        { label: "Grade bands", value: grades.length },
        { label: "Pass bands", value: grades.filter((g) => g.result !== "Fail").length, tone: "#166534" },
        { label: "Fail bands", value: grades.filter((g) => g.result === "Fail").length, tone: "#B91C1C" },
        {
            label: problems.length === 0 && grades.length > 0 ? "Full 0-100% coverage" : "Coverage issues",
            value: grades.length === 0 ? "-" : problems.length === 0 ? "OK" : problems.length,
            tone: problems.length === 0 ? "#166534" : "#B45309"
        }
    ];

    return (

        <Box sx={{ maxWidth: 900 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 46, height: 46, minWidth: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <GradeIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>Grading Scale</Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                        Percentage bands used to give each student a grade, e.g. 91-100% = A1
                    </Typography>
                </Box>
                <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>
                    Add grade
                </Button>
            </Box>

            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                    <CircularProgress />
                </Box>
            )}

            {!loading && grades.length === 0 && (
                <Card sx={{ p: 4, textAlign: "center" }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No grade bands yet</Typography>
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                        Add bands such as A1 (91-100%) so grades are worked out when marks are entered.
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openAddDialog}>Add grade</Button>
                </Card>
            )}

            {!loading && grades.length > 0 && (
                <>
                    <StatChips items={stats} />

                    {/* ---------- visual 0-100 scale ---------- */}
                    <Card sx={{ p: 2, mb: 1.5, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                        <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.4, color: "text.secondary", mb: 1 }}>
                            SCALE 0% - 100%
                        </Typography>
                        <Box data-testid="scale-bar" sx={{ position: "relative", height: 34, borderRadius: 2, bgcolor: "#E2E8F0", overflow: "hidden" }}>
                            {sorted.map((g, i) => {
                                const min = Number(g.minimum_percentage);
                                const max = Number(g.maximum_percentage);
                                const width = Math.max(max - min, 1);
                                return (
                                    <Tooltip key={g.id} title={`${g.grade_name}: ${min}% - ${max}%`}>
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                left: `${min}%`,
                                                width: `${Math.min(width, 100 - min)}%`,
                                                top: 0,
                                                bottom: 0,
                                                bgcolor: colourFor(g, i),
                                                color: "#fff",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                fontSize: "0.72rem",
                                                fontWeight: 800,
                                                borderRight: "1px solid rgba(255,255,255,0.7)",
                                                overflow: "hidden"
                                            }}
                                        >
                                            {width >= 6 ? g.grade_name : ""}
                                        </Box>
                                    </Tooltip>
                                );
                            })}
                        </Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5, fontSize: "0.72rem", color: "text.secondary" }}>
                            <span>0%</span><span>50%</span><span>100%</span>
                        </Box>
                        {problems.length > 0 && (
                            <Alert severity="warning" sx={{ mt: 1.25 }}>
                                <Box component="ul" sx={{ m: 0, pl: 2 }}>
                                    {problems.map((p) => <li key={p}>{p}</li>)}
                                </Box>
                            </Alert>
                        )}
                    </Card>

                    {/* ---------- grade list ---------- */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {sorted.map((grade, i) => (
                            <Box
                                key={grade.id}
                                data-testid="grade-row"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    p: 1.5,
                                    borderRadius: 3,
                                    bgcolor: "#fff",
                                    border: "1px solid var(--sl-border, #E2E8F0)",
                                    boxShadow: "var(--sl-card-shadow, none)"
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        borderRadius: 2.5,
                                        bgcolor: colourFor(grade, i),
                                        color: "#fff",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 800,
                                        fontSize: "1.05rem",
                                        flexShrink: 0
                                    }}
                                >
                                    {grade.grade_name}
                                </Box>

                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 700 }}>
                                        {Number(grade.minimum_percentage)}% - {Number(grade.maximum_percentage)}%
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                                        {grade.grade_point !== null && grade.grade_point !== undefined && grade.grade_point !== ""
                                            ? `Grade point ${grade.grade_point}`
                                            : "No grade point"}
                                    </Typography>
                                </Box>

                                <Chip
                                    size="small"
                                    label={grade.result}
                                    sx={grade.result === "Fail"
                                        ? { bgcolor: "#FEE2E2", color: "#B91C1C", fontWeight: 700 }
                                        : { bgcolor: "#DCFCE7", color: "#166534", fontWeight: 700 }}
                                />

                                <Box sx={{ display: "flex" }}>
                                    <IconButton size="small" aria-label={`Edit ${grade.grade_name}`} onClick={() => openEditDialog(grade)}>
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton size="small" aria-label={`Delete ${grade.grade_name}`} onClick={() => setDeleting(grade)}>
                                        <DeleteOutlineIcon fontSize="small" sx={{ color: "#DC2626" }} />
                                    </IconButton>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </>
            )}

            {/* ---------- add / edit dialog ---------- */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth fullScreen={fullScreen}>
                <DialogTitle sx={{ fontWeight: 800 }}>
                    {editingId ? "Edit grade" : "Add grade"}
                </DialogTitle>
                <DialogContent>
                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                        <TextField
                            label="Grade name (e.g. A1)"
                            fullWidth
                            autoFocus
                            value={form.grade_name}
                            onChange={(e) => setForm({ ...form, grade_name: e.target.value })}
                        />
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Min %"
                                type="number"
                                fullWidth
                                value={form.minimum_percentage}
                                onChange={(e) => setForm({ ...form, minimum_percentage: e.target.value })}
                            />
                            <TextField
                                label="Max %"
                                type="number"
                                fullWidth
                                value={form.maximum_percentage}
                                onChange={(e) => setForm({ ...form, maximum_percentage: e.target.value })}
                            />
                        </Box>
                        <Box sx={{ display: "flex", gap: 2 }}>
                            <TextField
                                label="Grade point (optional)"
                                type="number"
                                fullWidth
                                value={form.grade_point}
                                onChange={(e) => setForm({ ...form, grade_point: e.target.value })}
                            />
                            <TextField
                                select
                                label="Result"
                                fullWidth
                                value={form.result}
                                onChange={(e) => setForm({ ...form, result: e.target.value })}
                            >
                                <MenuItem value="Pass">Pass</MenuItem>
                                <MenuItem value="Fail">Fail</MenuItem>
                            </TextField>
                        </Box>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 2.5, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveClick} disabled={saving}>
                        {saving ? "Saving..." : "Save"}
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

            <ConfirmDialog
                open={Boolean(deleting)}
                title="Delete this grade band?"
                message={deleting ? `${deleting.grade_name} (${Number(deleting.minimum_percentage)}% - ${Number(deleting.maximum_percentage)}%) will be removed. This can't be undone.` : ""}
                confirmLabel="Delete"
                confirmColor="error"
                onConfirm={confirmDelete}
                onCancel={() => setDeleting(null)}
            />

        </Box>

    );

}

export default GradesPage;
