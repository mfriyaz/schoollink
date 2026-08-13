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
    Grid,
    IconButton,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/AddOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import RestoreIcon from "@mui/icons-material/RestoreOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import AssignmentIndIcon from "@mui/icons-material/AssignmentIndOutlined";

import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import VpnKeyIcon from "@mui/icons-material/VpnKeyOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";

import {
    getMyTeachers,
    createTeacherRecord,
    updateTeacherRecord,
    deactivateTeacherRecord,
    reactivateTeacherRecord,
    addLoginToExistingTeacher
} from "../../services/teacherManagementService";

import { getAllSubjectsForManagement } from "../../services/subjectManagementService";

import {
    getAllClassesForManagement,
    getAllSectionsForClass
} from "../../services/classManagementService";

import {
    createTeacherSubjectAssignment,
    getAssignmentsByTeacher,
    deleteTeacherSubjectAssignment
} from "../../services/teacherSubjectService";

const emptyForm = {

    employee_no: "",

    first_name: "",

    last_name: "",

    gender: "",

    phone: "",

    email: "",

    qualification: "",

    experience_years: "",

    joining_date: "",

    temporary_password: ""

};

function TeachersPage() {

    const [teachers, setTeachers] = useState([]);

    const [loading, setLoading] = useState(true);

    const [dialogOpen, setDialogOpen] = useState(false);

    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(emptyForm);

    const [saving, setSaving] = useState(false);

    const [formError, setFormError] = useState("");

    const [pageError, setPageError] = useState("");

    const [assignDialogOpen, setAssignDialogOpen] = useState(false);

    const [assignTeacher, setAssignTeacher] = useState(null);

    const [subjects, setSubjects] = useState([]);

    const [classes, setClasses] = useState([]);

    const [sections, setSections] = useState([]);

    const [assignSubjectId, setAssignSubjectId] = useState("");

    const [assignClassId, setAssignClassId] = useState("");

    const [assignSectionId, setAssignSectionId] = useState("");

    const [isClassTeacher, setIsClassTeacher] = useState(false);

    const [assigning, setAssigning] = useState(false);

    const [assignError, setAssignError] = useState("");

    const [assignSuccess, setAssignSuccess] = useState("");

    const [currentAssignments, setCurrentAssignments] = useState([]);

    const [loadingAssignments, setLoadingAssignments] = useState(false);

    const [removingId, setRemovingId] = useState(null);

    const [loginDialogOpen, setLoginDialogOpen] = useState(false);

    const [loginTeacher, setLoginTeacher] = useState(null);

    const [loginEmail, setLoginEmail] = useState("");

    const [loginPassword, setLoginPassword] = useState("");

    const [addingLogin, setAddingLogin] = useState(false);

    const [loginError, setLoginError] = useState("");

    const [loginSuccess, setLoginSuccess] = useState("");

    useEffect(() => {

        loadTeachers();

    }, []);

    async function loadTeachers() {

        try {

            const response = await getMyTeachers();

            if (response.success) {

                setTeachers(response.data);

            }

        } catch (err) {

            setPageError(
                err.response?.data?.message ||
                "Unable to load teachers."
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

    function openEditDialog(teacher) {

        setEditingId(teacher.id);

        setForm({

            employee_no: teacher.employee_no || "",

            first_name: teacher.first_name || "",

            last_name: teacher.last_name || "",

            gender: teacher.gender || "",

            phone: teacher.phone || "",

            email: teacher.email || "",

            qualification: teacher.qualification || "",

            experience_years: teacher.experience_years || "",

            joining_date: teacher.joining_date
                ? teacher.joining_date.slice(0, 10)
                : ""

        });

        setFormError("");

        setDialogOpen(true);

    }

    async function openAssignDialog(teacher) {

        setAssignTeacher(teacher);

        setAssignSubjectId("");

        setAssignClassId("");

        setAssignSectionId("");

        setIsClassTeacher(false);

        setAssignError("");

        setAssignSuccess("");

        setAssignDialogOpen(true);

        loadCurrentAssignments(teacher.id);

        try {

            const [subjectsResponse, classesResponse] = await Promise.all([

                getAllSubjectsForManagement(),

                getAllClassesForManagement()

            ]);

            if (subjectsResponse.success) {

                setSubjects(subjectsResponse.data.filter((s) => s.is_active));

            }

            if (classesResponse.success) {

                setClasses(classesResponse.data.filter((c) => c.is_active));

            }

        } catch (err) {

            setAssignError("Unable to load subjects/classes.");

        }

    }

    async function handleClassChange(classId) {

        setAssignClassId(classId);

        setAssignSectionId("");

        setSections([]);

        if (!classId) {

            return;

        }

        try {

            const response = await getAllSectionsForClass(classId);

            if (response.success) {

                setSections(response.data.filter((s) => s.is_active));

            }

        } catch (err) {

            console.error(err);

        }

    }

    async function loadCurrentAssignments(teacherId) {

        try {

            setLoadingAssignments(true);

            const response = await getAssignmentsByTeacher(teacherId);

            if (response.success) {

                setCurrentAssignments(response.data);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoadingAssignments(false);

        }

    }

    async function handleRemoveAssignment(assignmentId) {

        try {

            setRemovingId(assignmentId);

            const response = await deleteTeacherSubjectAssignment(assignmentId);

            if (response.success) {

                setCurrentAssignments((prev) =>
                    prev.filter((a) => a.teacher_subject_id !== assignmentId)
                );

            } else {

                setAssignError(response.message);

            }

        } catch (err) {

            setAssignError(

                err.response?.data?.message ||
                "Unable to remove this assignment."

            );

        } finally {

            setRemovingId(null);

        }

    }

    async function handleAssign() {

        setAssignError("");

        setAssignSuccess("");

        if (!assignSubjectId || !assignClassId || !assignSectionId) {

            setAssignError("Please select a subject, class, and section.");

            return;

        }

        try {

            setAssigning(true);

            const response = await createTeacherSubjectAssignment({

                teacher_id: assignTeacher.id,

                subject_id: assignSubjectId,

                class_id: assignClassId,

                section_id: assignSectionId,

                academic_year_id: 1,

                is_class_teacher: isClassTeacher

            });

            if (response.success) {

                setAssignSuccess("Teacher assigned successfully!");

                setAssignSubjectId("");

                setAssignClassId("");

                setAssignSectionId("");

                setIsClassTeacher(false);

                await loadCurrentAssignments(assignTeacher.id);

            } else {

                setAssignError(response.message);

            }

        } catch (err) {

            setAssignError(

                err.response?.data?.message ||
                "Unable to assign this teacher."

            );

        } finally {

            setAssigning(false);

        }

    }

    function openLoginDialog(teacher) {

        setLoginTeacher(teacher);

        setLoginEmail(teacher.email || "");

        setLoginPassword("");

        setLoginError("");

        setLoginSuccess("");

        setLoginDialogOpen(true);

    }

    async function handleAddLogin() {

        setLoginError("");

        setLoginSuccess("");

        if (!loginEmail || !loginPassword) {

            setLoginError("Email and a temporary password are required.");

            return;

        }

        try {

            setAddingLogin(true);

            const response = await addLoginToExistingTeacher(loginTeacher.id, {

                email: loginEmail,

                temporary_password: loginPassword

            });

            if (response.success) {

                setLoginSuccess("Login created and emailed to the teacher!");

                await loadTeachers();

            } else {

                setLoginError(response.message);

            }

        } catch (err) {

            setLoginError(

                err.response?.data?.message ||
                "Unable to add a login for this teacher."

            );

        } finally {

            setAddingLogin(false);

        }

    }

    async function handleSave() {

        setFormError("");

        if (!form.employee_no || !form.first_name || !form.last_name) {

            setFormError("Employee No, First Name and Last Name are required.");

            return;

        }

        if (!/^[a-zA-Z0-9]+$/.test(form.employee_no)) {

            setFormError("Employee No can only contain letters and numbers.");

            return;

        }

        if (!/^[a-zA-Z ]+$/.test(form.first_name)) {

            setFormError("First Name can only contain letters.");

            return;

        }

        if (!/^[a-zA-Z ]+$/.test(form.last_name)) {

            setFormError("Last Name can only contain letters.");

            return;

        }

        if (form.phone && !/^[0-9]+$/.test(form.phone)) {

            setFormError("Phone can only contain numbers.");

            return;

        }

        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {

            setFormError("Please enter a valid email address.");

            return;

        }

        if (
            form.experience_years !== "" &&
            (!/^[0-9]+$/.test(form.experience_years) || Number(form.experience_years) < 0)
        ) {

            setFormError("Experience must be a whole number of years.");

            return;

        }

        try {

            setSaving(true);

            const response = editingId

                ? await updateTeacherRecord(editingId, form)

                : await createTeacherRecord(form);

            if (response.success) {

                setDialogOpen(false);

                await loadTeachers();

            } else {

                setFormError(response.message);

            }

        } catch (err) {

            setFormError(
                err.response?.data?.message ||
                "Unable to save this teacher."
            );

        } finally {

            setSaving(false);

        }

    }

    async function handleDeactivate(id) {

        try {

            await deactivateTeacherRecord(id);

            await loadTeachers();

        } catch (err) {

            setPageError(
                err.response?.data?.message ||
                "Unable to deactivate this teacher."
            );

        }

    }

    async function handleReactivate(id) {

        try {

            await reactivateTeacherRecord(id);

            await loadTeachers();

        } catch (err) {

            setPageError(
                err.response?.data?.message ||
                "Unable to reactivate this teacher."
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

                    Teachers

                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreateDialog}
                >

                    Add Teacher

                </Button>

            </Box>

            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

            {teachers.length === 0 && (

                <Typography color="text.secondary">

                    No teachers added yet.

                </Typography>

            )}

            {teachers.map((teacher) => (

                <Card key={teacher.id} sx={{ p: 2.5, mb: 2 }}>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1.5 }}>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                            <Avatar sx={{ bgcolor: teacher.is_active ? "#DBEAFE" : "#F1F5F9" }}>

                                <SchoolIcon sx={{ color: teacher.is_active ? "#2563EB" : "#94A3B8" }} fontSize="small" />

                            </Avatar>

                            <Box>

                                <Typography sx={{ fontWeight: 600 }}>

                                    {teacher.first_name} {teacher.last_name}

                                </Typography>

                                <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>

                                    {teacher.employee_no} · {teacher.email || "No email"}
                                    {teacher.qualification && ` · ${teacher.qualification}`}

                                </Typography>

                            </Box>

                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>

                            <Chip
                                size="small"
                                color={teacher.is_active ? "success" : "default"}
                                label={teacher.is_active ? "Active" : "Inactive"}
                            />

                            {!teacher.user_id && (

                                <Button
                                    size="small"
                                    color="warning"
                                    startIcon={<VpnKeyIcon fontSize="small" />}
                                    onClick={() => openLoginDialog(teacher)}
                                >

                                    Add Login

                                </Button>

                            )}

                            <Button
                                size="small"
                                startIcon={<AssignmentIndIcon fontSize="small" />}
                                onClick={() => openAssignDialog(teacher)}
                            >

                                Assign

                            </Button>

                            <Button
                                size="small"
                                startIcon={<EditIcon fontSize="small" />}
                                onClick={() => openEditDialog(teacher)}
                            >

                                Edit

                            </Button>

                            {teacher.is_active ? (

                                <Button
                                    size="small"
                                    color="error"
                                    startIcon={<BlockIcon fontSize="small" />}
                                    onClick={() => handleDeactivate(teacher.id)}
                                >

                                    Deactivate

                                </Button>

                            ) : (

                                <Button
                                    size="small"
                                    color="success"
                                    startIcon={<RestoreIcon fontSize="small" />}
                                    onClick={() => handleReactivate(teacher.id)}
                                >

                                    Reactivate

                                </Button>

                            )}

                        </Box>

                    </Box>

                </Card>

            ))}

            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>

                <DialogTitle sx={{ fontWeight: 700 }}>

                    {editingId ? "Edit Teacher" : "Add Teacher"}

                </DialogTitle>

                <DialogContent>

                    {formError && <Alert severity="error" sx={{ mb: 2 }}>{formError}</Alert>}

                    <Grid container spacing={2} sx={{ mt: 0.5 }}>

                        <Grid size={{ xs: 12 }}>

                            <TextField
                                label="Employee No"
                                value={form.employee_no}
                                onChange={(e) => setForm({ ...form, employee_no: e.target.value })}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>

                            <TextField
                                label="First Name"
                                value={form.first_name}
                                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>

                            <TextField
                                label="Last Name"
                                value={form.last_name}
                                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>

                            <TextField
                                select
                                label="Gender"
                                value={form.gender}
                                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                                fullWidth
                                size="small"
                            >

                                <MenuItem value="">Select Gender</MenuItem>

                                <MenuItem value="Male">Male</MenuItem>

                                <MenuItem value="Female">Female</MenuItem>

                            </TextField>

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>

                            <TextField
                                label="Phone"
                                value={form.phone}
                                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>

                            <TextField
                                label="Email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                fullWidth
                                size="small"
                                helperText={!editingId ? "This becomes the teacher's login email" : ""}
                            />

                        </Grid>

                        {!editingId && (

                            <Grid size={{ xs: 12, sm: 6 }}>

                                <TextField
                                    label="Temporary Password (optional)"
                                    value={form.temporary_password}
                                    onChange={(e) => setForm({ ...form, temporary_password: e.target.value })}
                                    fullWidth
                                    size="small"
                                    helperText="Leave blank to create a profile-only record with no login"
                                />

                            </Grid>

                        )}

                        <Grid size={{ xs: 12, sm: 6 }}>

                            <TextField
                                label="Qualification"
                                value={form.qualification}
                                onChange={(e) => setForm({ ...form, qualification: e.target.value })}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>

                            <TextField
                                label="Experience (years)"
                                type="number"
                                value={form.experience_years}
                                onChange={(e) => setForm({ ...form, experience_years: e.target.value })}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                        <Grid size={{ xs: 12, sm: 6 }}>

                            <SchoolDatePicker
                                label="Joining Date"
                                value={form.joining_date}
                                onChange={(val) => setForm({ ...form, joining_date: val })}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                    </Grid>

                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 3 }}>

                    <Button onClick={() => setDialogOpen(false)}>Cancel</Button>

                    <Button variant="contained" onClick={handleSave} disabled={saving}>

                        {saving ? "Saving..." : "Save"}

                    </Button>

                </DialogActions>

            </Dialog>

            <Dialog open={assignDialogOpen} onClose={() => setAssignDialogOpen(false)} maxWidth="sm" fullWidth>

                <DialogTitle>

                    Assign {assignTeacher ? `${assignTeacher.first_name} ${assignTeacher.last_name}` : "Teacher"}

                </DialogTitle>

                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

                    {assignError && <Alert severity="error">{assignError}</Alert>}

                    {assignSuccess && <Alert severity="success">{assignSuccess}</Alert>}

                    <Box sx={{ bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 3, p: 2 }}>

                        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", mb: 1, color: "#334155" }}>

                            📋 Current Assignments

                        </Typography>

                        {loadingAssignments && (

                            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>

                                <CircularProgress size={20} />

                            </Box>

                        )}

                        {!loadingAssignments && currentAssignments.length === 0 && (

                            <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem", py: 1 }}>

                                Not assigned to any subject/class yet.

                            </Typography>

                        )}

                        {!loadingAssignments && currentAssignments.length > 0 && (

                            <Box

                                sx={{

                                    display: "flex",

                                    flexDirection: "column",

                                    gap: 1,

                                    maxHeight: 220,

                                    overflowY: "auto"

                                }}

                            >

                                {currentAssignments.map((a) => (

                                    <Box

                                        key={a.teacher_subject_id}

                                        sx={{

                                            display: "flex",

                                            alignItems: "center",

                                            justifyContent: "space-between",

                                            bgcolor: "white",

                                            border: "1px solid #E2E8F0",

                                            borderRadius: 2,

                                            px: 1.5,

                                            py: 1

                                        }}

                                    >

                                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 500 }}>

                                            {a.subject_name} · {a.class_name} - {a.section_name}

                                        </Typography>

                                        <IconButton

                                            size="small"

                                            onClick={() => handleRemoveAssignment(a.teacher_subject_id)}

                                            disabled={removingId === a.teacher_subject_id}
                                        >

                                            <DeleteOutlineIcon fontSize="small" sx={{ color: "#DC2626" }} />

                                        </IconButton>

                                    </Box>

                                ))}

                            </Box>

                        )}

                    </Box>

                    <Box sx={{ bgcolor: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 3, p: 2, display: "flex", flexDirection: "column", gap: 2 }}>

                        <Typography sx={{ fontWeight: 700, fontSize: "0.9rem", color: "#1E40AF" }}>

                            ➕ Add New Assignment

                        </Typography>

                    <TextField
                        select
                        label="Subject"
                        size="small"
                        fullWidth
                        value={assignSubjectId}
                        onChange={(e) => setAssignSubjectId(e.target.value)}
                    >

                        {subjects.map((s) => (

                            <MenuItem key={s.id} value={s.id}>{s.subject_name}</MenuItem>

                        ))}

                    </TextField>

                    <TextField
                        select
                        label="Class"
                        size="small"
                        fullWidth
                        value={assignClassId}
                        onChange={(e) => handleClassChange(e.target.value)}
                    >

                        {classes.map((c) => (

                            <MenuItem key={c.id} value={c.id}>{c.class_name}</MenuItem>

                        ))}

                    </TextField>

                    <TextField
                        select
                        label="Section"
                        size="small"
                        fullWidth
                        value={assignSectionId}
                        onChange={(e) => setAssignSectionId(e.target.value)}
                        disabled={!assignClassId}
                    >

                        {sections.map((s) => (

                            <MenuItem key={s.id} value={s.id}>{s.section_name}</MenuItem>

                        ))}

                    </TextField>

                    <Box

                        onClick={() => setIsClassTeacher((v) => !v)}

                        sx={{

                            display: "flex",

                            alignItems: "center",

                            gap: 1,

                            cursor: "pointer",

                            color: isClassTeacher ? "#2563EB" : "#64748B"

                        }}

                    >

                        <SchoolIcon fontSize="small" />

                        <Typography sx={{ fontSize: "0.85rem" }}>

                            {isClassTeacher ? "✓ Set as Class Teacher for this section" : "Set as Class Teacher for this section"}

                        </Typography>

                    </Box>

                    </Box>

                </DialogContent>

                <DialogActions>

                    <Button onClick={() => setAssignDialogOpen(false)}>

                        Close

                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleAssign}
                        disabled={assigning}
                    >

                        {assigning ? "Assigning..." : "Assign"}

                    </Button>

                </DialogActions>

            </Dialog>

            <Dialog open={loginDialogOpen} onClose={() => setLoginDialogOpen(false)} maxWidth="xs" fullWidth>

                <DialogTitle>

                    Add Login for {loginTeacher ? `${loginTeacher.first_name} ${loginTeacher.last_name}` : "Teacher"}

                </DialogTitle>

                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

                    {loginError && <Alert severity="error">{loginError}</Alert>}

                    {loginSuccess && <Alert severity="success">{loginSuccess}</Alert>}

                    <TextField
                        label="Login Email"
                        size="small"
                        fullWidth
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                    />

                    <TextField
                        label="Temporary Password"
                        size="small"
                        fullWidth
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                    />

                </DialogContent>

                <DialogActions>

                    <Button onClick={() => setLoginDialogOpen(false)}>

                        Close

                    </Button>

                    <Button
                        variant="contained"
                        onClick={handleAddLogin}
                        disabled={addingLogin}
                    >

                        {addingLogin ? "Adding..." : "Add Login"}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    );

}

export default TeachersPage;
