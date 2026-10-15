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
    Menu,
    MenuItem,
    Switch,
    TextField,
    useMediaQuery,
    useTheme,
    Typography
} from "@mui/material";

import AddIcon from "@mui/icons-material/AddOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import RestoreIcon from "@mui/icons-material/RestoreOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import AssignmentIndIcon from "@mui/icons-material/AssignmentIndOutlined";
import SearchIcon from "@mui/icons-material/SearchRounded";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import CloseIcon from "@mui/icons-material/CloseRounded";
import StarIcon from "@mui/icons-material/StarRounded";
import MoreVertIcon from "@mui/icons-material/MoreVertRounded";

import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import VpnKeyIcon from "@mui/icons-material/VpnKeyOutlined";
import ResetPasswordDialog from "../../components/common/ResetPasswordDialog";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";

import {
    getMyTeachers,
    createTeacherRecord,
    updateTeacherRecord,
    deactivateTeacherRecord,
    reactivateTeacherRecord,
    addLoginToExistingTeacher,
    setTeacherUsername
} from "../../services/teacherManagementService";

import { getAllSubjectsForManagement } from "../../services/subjectManagementService";

import {
    getAllClassesForManagement,
    getAllSectionsForClass
} from "../../services/classManagementService";

import {
    getSchoolAssignments,
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

    username: "",

    qualification: "",

    experience_years: "",

    joining_date: "",

    temporary_password: ""

};

function initials(t) {
    return `${(t.first_name || "?")[0]}${(t.last_name || "")[0] || ""}`.toUpperCase();
}

function prettyJoin(d) {
    const dt = new Date(String(d).slice(0, 10) + "T00:00:00Z");
    if (Number.isNaN(dt.getTime())) return "";
    return dt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function TeachersPage() {

    const theme = useTheme();

    const isPhone = useMediaQuery(theme.breakpoints.down("sm"));

    const [teachers, setTeachers] = useState([]);

    const [allAssignments, setAllAssignments] = useState([]);

    const [assignmentsReady, setAssignmentsReady] = useState(false);

    const [search, setSearch] = useState("");

    const [filter, setFilter] = useState("all");

    const [menu, setMenu] = useState(null);

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

    const [loginUsername, setLoginUsername] = useState("");

    const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
    const [resetTeacher, setResetTeacher] = useState(null);

    const [usernameTeacher, setUsernameTeacher] = useState(null);

    const [usernameValue, setUsernameValue] = useState("");

    const [settingUsername, setSettingUsername] = useState(false);

    const [usernameError, setUsernameError] = useState("");

    const [usernameSuccess, setUsernameSuccess] = useState("");

    const [loginPassword, setLoginPassword] = useState("");

    const [addingLogin, setAddingLogin] = useState(false);

    const [loginError, setLoginError] = useState("");

    const [loginSuccess, setLoginSuccess] = useState("");

    useEffect(() => {

        loadTeachers();

    }, []);

    async function loadAssignments() {

        try {

            const response = await getSchoolAssignments();

            if (response.success) setAllAssignments(response.data);

        } catch (err) {

            // the list still works without the class and subject chips

        } finally {

            setAssignmentsReady(true);

        }

    }

    useEffect(() => {

        // refresh the chips after the Assign dialog is closed
        if (!assignDialogOpen) loadAssignments();

    }, [assignDialogOpen]);

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

            const raw = err.response?.data?.message || "";

            setAssignError(

                /foreign key|violates|constraint/i.test(raw)
                    ? "This assignment can't be removed because it already has attendance, homework or marks recorded. Those records are kept for the school's history."
                    : raw || "Unable to remove this assignment."

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

        setLoginUsername("");

        setLoginPassword("");

        setLoginError("");

        setLoginSuccess("");

        setLoginDialogOpen(true);

    }

    function openUsernameDialog(teacher) {

        setUsernameTeacher(teacher);

        setUsernameValue(teacher.username || "");

        setUsernameError("");

        setUsernameSuccess("");

        setUsernameDialogOpen(true);

    }

    async function handleSetUsername() {

        setUsernameError("");

        setUsernameSuccess("");

        if (!usernameValue) {

            setUsernameError("Enter a username.");

            return;

        }

        try {

            setSettingUsername(true);

            const response = await setTeacherUsername(usernameTeacher.id, usernameValue);

            if (response.success) {

                setUsernameSuccess("Username saved!");

                await loadTeachers();

            } else {

                setUsernameError(response.message);

            }

        } catch (err) {

            setUsernameError(

                err.response?.data?.message ||
                "Unable to save this username."

            );

        } finally {

            setSettingUsername(false);

        }

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

                username: loginUsername || undefined,

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

    const assignmentsByTeacher = {};
    allAssignments.forEach((a) => {
        (assignmentsByTeacher[a.teacher_id] = assignmentsByTeacher[a.teacher_id] || []).push(a);
    });

    const stats = {
        total: teachers.length,
        active: teachers.filter((t) => t.is_active).length,
        unassigned: assignmentsReady
            ? teachers.filter((t) => t.is_active && !(assignmentsByTeacher[t.id] || []).length).length
            : 0,
        noLogin: teachers.filter((t) => t.is_active && !t.user_id).length
    };

    const q = search.trim().toLowerCase();

    const visibleTeachers = teachers.filter((t) => {

        const mine = assignmentsByTeacher[t.id] || [];

        if (filter === "active" && !t.is_active) return false;
        if (filter === "inactive" && t.is_active) return false;
        if (filter === "unassigned" && (!t.is_active || mine.length)) return false;
        if (filter === "nologin" && (!t.is_active || t.user_id)) return false;

        if (!q) return true;

        const hay = [
            t.first_name, t.last_name, t.employee_no, t.email, t.phone, t.qualification,
            ...mine.flatMap((a) => [a.class_name, a.section_name, a.subject_name])
        ].join(" ").toLowerCase();

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

            {/* ---------- Header ---------- */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, gap: 1.5, flexWrap: "wrap" }}>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, lineHeight: 1.2 }}>Teachers</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {stats.total} teachers - {stats.active} active
                    </Typography>
                </Box>

                <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateDialog}>
                    Add Teacher
                </Button>

            </Box>

            {pageError && <Alert severity="error" sx={{ mb: 2 }}>{pageError}</Alert>}

            {/* ---------- At a glance (small chips) ---------- */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 1, mb: 1.5 }}>
                {[
                    { label: "Total", value: stats.total, filter: "all" },
                    { label: "Active", value: stats.active, filter: "active", tone: "#16A34A" },
                    { label: "Not assigned", value: stats.unassigned, filter: "unassigned", tone: stats.unassigned ? "#B45309" : undefined },
                    { label: "No login", value: stats.noLogin, filter: "nologin", tone: stats.noLogin ? "#B45309" : undefined }
                ].map((s) => (
                    <Box
                        key={s.label}
                        onClick={() => setFilter(s.filter)}
                        sx={{
                            display: "flex",
                            alignItems: "baseline",
                            gap: 0.75,
                            px: 1.5,
                            py: 0.75,
                            cursor: "pointer",
                            borderRadius: 2,
                            bgcolor: "#fff",
                            border: "1px solid var(--sl-border, #EEF2F7)",
                            outline: filter === s.filter ? "2px solid var(--sl-accent, var(--sl-primary))" : "none"
                        }}
                    >
                        <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.2, color: s.tone || "var(--sl-ink, var(--sl-ink))" }}>
                            {s.value}
                        </Typography>
                        <Typography sx={{ fontSize: "0.76rem", color: "text.secondary" }} noWrap>{s.label}</Typography>
                    </Box>
                ))}
            </Box>

            {/* ---------- Search and filter ---------- */}
            <Box sx={{ display: "flex", gap: 1.25, alignItems: "center", flexWrap: "wrap", mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search name, employee no, class or subject"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: "1 1 260px", maxWidth: 460 }}
                    slotProps={{
                        input: {
                            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 0.75, color: "text.secondary" }} />
                        }
                    }}
                />
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    {[
                        ["all", "All"], ["active", "Active"], ["inactive", "Inactive"],
                        ["unassigned", "Not assigned"], ["nologin", "No login"]
                    ].map(([id, label]) => (
                        <Chip
                            key={id}
                            label={label}
                            size="small"
                            onClick={() => setFilter(id)}
                            sx={{
                                fontWeight: 600,
                                bgcolor: filter === id ? "var(--sl-ink, var(--sl-ink))" : "var(--sl-soft, #F1F5F9)",
                                color: filter === id ? "#fff" : "var(--sl-ink, var(--sl-ink))",
                                "&:hover": { bgcolor: filter === id ? "var(--sl-ink, var(--sl-ink))" : "var(--sl-soft2, #E2E8F0)" }
                            }}
                        />
                    ))}
                </Box>
            </Box>

            {teachers.length === 0 && (
                <Typography color="text.secondary">No teachers added yet.</Typography>
            )}

            {teachers.length > 0 && visibleTeachers.length === 0 && (
                <Typography color="text.secondary">No teachers match your search.</Typography>
            )}

            {/* ---------- Teacher cards ---------- */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 1.5 }}>

                {visibleTeachers.map((teacher) => {

                    const mine = assignmentsByTeacher[teacher.id] || [];
                    const classTeacherOf = mine.filter((a) => a.is_class_teacher);
                    const shown = mine.slice(0, 6);
                    const hasLogin = !!teacher.user_id;

                    return (
                        <Card
                            key={teacher.id}
                            data-testid="teacher-card"
                            sx={{
                                p: { xs: 1.75, md: 2.25 },
                                borderRadius: 3,
                                border: "1px solid var(--sl-border, #EEF2F7)",
                                boxShadow: "var(--sl-card-shadow, 0 1px 3px rgba(15,23,42,.06))",
                                opacity: teacher.is_active ? 1 : 0.72,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1.25
                            }}
                        >

                            {/* Name row */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar
                                    sx={{
                                        width: 44, height: 44, fontWeight: 800,
                                        bgcolor: teacher.is_active ? "var(--sl-soft, var(--sl-soft))" : "#F1F5F9",
                                        color: teacher.is_active ? "var(--sl-ink, var(--sl-primary))" : "#94A3B8"
                                    }}
                                >
                                    {initials(teacher)}
                                </Avatar>

                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap>
                                        {teacher.first_name} {teacher.last_name}
                                    </Typography>
                                    <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }} noWrap>
                                        {teacher.employee_no}
                                        {teacher.qualification && ` - ${teacher.qualification}`}
                                    </Typography>
                                </Box>

                                <Chip
                                    size="small"
                                    label={teacher.is_active ? "Active" : "Inactive"}
                                    sx={{
                                        fontWeight: 700,
                                        bgcolor: teacher.is_active ? "#DCFCE7" : "#F1F5F9",
                                        color: teacher.is_active ? "#15803D" : "#64748B"
                                    }}
                                />
                            </Box>

                            {/* Contact and experience */}
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.4 }}>
                                {teacher.phone && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
                                        <PhoneIcon sx={{ fontSize: 16 }} />
                                        <Typography sx={{ fontSize: "0.84rem" }}>{teacher.phone}</Typography>
                                    </Box>
                                )}
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary", minWidth: 0 }}>
                                    <EmailIcon sx={{ fontSize: 16 }} />
                                    <Typography sx={{ fontSize: "0.84rem" }} noWrap>{teacher.email || "No email"}</Typography>
                                </Box>
                                {(teacher.experience_years || teacher.joining_date) && (
                                    <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", pl: 3 }}>
                                        {teacher.experience_years ? `${teacher.experience_years} yrs experience` : ""}
                                        {teacher.experience_years && teacher.joining_date ? " - " : ""}
                                        {teacher.joining_date ? `Joined ${prettyJoin(teacher.joining_date)}` : ""}
                                    </Typography>
                                )}
                            </Box>

                            {/* Classes and subjects */}
                            <Box
                                sx={{
                                    p: 1.25,
                                    borderRadius: 2,
                                    bgcolor: "var(--sl-page2, #F8FAFC)",
                                    border: "1px solid var(--sl-border, #EEF2F7)"
                                }}
                            >
                                <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", mb: 0.75, letterSpacing: 0.3 }}>
                                    {mine.length ? `TEACHING ${mine.length} ${mine.length === 1 ? "SUBJECT" : "SUBJECTS"}` : "CLASSES AND SUBJECTS"}
                                </Typography>

                                {mine.length === 0 ? (
                                    <Typography sx={{ fontSize: "0.84rem", color: assignmentsReady ? "#B45309" : "text.secondary" }}>
                                        {assignmentsReady ? "Not assigned to any class yet." : "Loading..."}
                                    </Typography>
                                ) : (
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                                        {classTeacherOf.map((a) => (
                                            <Chip
                                                key={"ct" + a.id}
                                                size="small"
                                                icon={<StarIcon sx={{ fontSize: 15, color: "#B45309 !important" }} />}
                                                label={`Class teacher ${a.class_name}-${a.section_name}`}
                                                sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 700 }}
                                            />
                                        ))}
                                        {shown.map((a) => (
                                            <Chip
                                                key={a.id}
                                                size="small"
                                                label={`${a.class_name}-${a.section_name} - ${a.subject_name}`}
                                                sx={{ bgcolor: "#fff", border: "1px solid var(--sl-border, #E2E8F0)" }}
                                            />
                                        ))}
                                        {mine.length > shown.length && (
                                            <Chip size="small" label={`+${mine.length - shown.length} more`} onClick={() => openAssignDialog(teacher)} />
                                        )}
                                    </Box>
                                )}
                            </Box>

                            {/* Login and actions */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mt: "auto" }}>

                                <Chip
                                    size="small"
                                    label={hasLogin ? (teacher.username ? `Login: ${teacher.username}` : "Has login") : "No login yet"}
                                    sx={{
                                        fontWeight: 600,
                                        bgcolor: hasLogin ? "#E0F2FE" : "#FEF3C7",
                                        color: hasLogin ? "#075985" : "#92400E"
                                    }}
                                />

                                <Box sx={{ flex: 1 }} />

                                <Button
                                    size="small"
                                    variant="outlined"
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

                                <IconButton
                                    size="small"
                                    aria-label="More actions"
                                    onClick={(e) => setMenu({ anchor: e.currentTarget, teacher })}
                                >
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>

                            </Box>

                        </Card>
                    );
                })}

            </Box>

            {/* ---------- More actions menu ---------- */}
            <Menu
                anchorEl={menu ? menu.anchor : null}
                open={!!menu}
                onClose={() => setMenu(null)}
            >
                {menu && !menu.teacher.user_id && (
                    <MenuItem onClick={() => { const t = menu.teacher; setMenu(null); openLoginDialog(t); }}>Add login</MenuItem>
                )}
                {menu && menu.teacher.user_id && (
                    <MenuItem onClick={() => { const t = menu.teacher; setMenu(null); openUsernameDialog(t); }}>
                        {menu.teacher.username ? "Edit username" : "Set username"}
                    </MenuItem>
                )}
                {menu && menu.teacher.user_id && (
                    <MenuItem onClick={() => { const t = menu.teacher; setMenu(null); setResetTeacher(t); }}>Reset password</MenuItem>
                )}
                {menu && menu.teacher.is_active && (
                    <MenuItem sx={{ color: "error.main" }} onClick={() => { const t = menu.teacher; setMenu(null); handleDeactivate(t.id); }}>
                        Deactivate
                    </MenuItem>
                )}
                {menu && !menu.teacher.is_active && (
                    <MenuItem sx={{ color: "success.main" }} onClick={() => { const t = menu.teacher; setMenu(null); handleReactivate(t.id); }}>
                        Reactivate
                    </MenuItem>
                )}
            </Menu>

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
                                    label="Username (optional)"
                                    value={form.username}
                                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                                    fullWidth
                                    size="small"
                                    helperText="Lets this teacher log in with a username instead of email"
                                />

                            </Grid>

                        )}

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

                    <Button loading={saving} loadingPosition="start" variant="contained" onClick={handleSave} disabled={saving}>

                        {saving ? "Saving..." : "Save"}

                    </Button>

                </DialogActions>

            </Dialog>

            <Dialog
                open={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                fullScreen={isPhone}
                slotProps={{ paper: { sx: { borderRadius: isPhone ? 0 : 4 } } }}
            >

                {/* ---------- Header ---------- */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, pt: 2.25, pb: 1.5 }}>
                    <Avatar sx={{ width: 46, height: 46, fontWeight: 800, bgcolor: "var(--sl-banner, #FFC400)", color: "var(--sl-on-banner, #111827)" }}>
                        {assignTeacher ? initials(assignTeacher) : "?"}
                    </Avatar>
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.2 }} noWrap>
                            {assignTeacher ? `${assignTeacher.first_name} ${assignTeacher.last_name || ""}` : "Teacher"}
                        </Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }} noWrap>
                            Classes and subjects
                            {assignTeacher && assignTeacher.employee_no ? ` - ${assignTeacher.employee_no}` : ""}
                        </Typography>
                    </Box>
                    <IconButton aria-label="Close" onClick={() => setAssignDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 0.5 }}>

                    {assignError && <Alert severity="error">{assignError}</Alert>}

                    {assignSuccess && <Alert severity="success">{assignSuccess}</Alert>}

                    {/* ---------- Current assignments ---------- */}
                    <Box>

                        <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.4, color: "text.secondary", mb: 0.75 }}>
                            CURRENTLY TEACHING{currentAssignments.length ? ` (${currentAssignments.length})` : ""}
                        </Typography>

                        {loadingAssignments && (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                                <CircularProgress size={20} />
                            </Box>
                        )}

                        {!loadingAssignments && currentAssignments.length === 0 && (
                            <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: "#FEF3C7", color: "#92400E", fontSize: "0.86rem" }}>
                                Not assigned to any class yet. Add the first one below.
                            </Box>
                        )}

                        {!loadingAssignments && currentAssignments.length > 0 && (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.75, maxHeight: 230, overflowY: "auto", pr: 0.5 }}>
                                {currentAssignments.map((a) => (
                                    <Box
                                        key={a.teacher_subject_id}
                                        data-testid="current-assignment"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1,
                                            px: 1.5,
                                            py: 0.75,
                                            borderRadius: 2.5,
                                            border: "1px solid var(--sl-border, #E2E8F0)",
                                            bgcolor: "var(--sl-page2, #F8FAFC)"
                                        }}
                                    >
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }} noWrap>{a.subject_name}</Typography>
                                            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                                                {a.class_name} - {a.section_name}
                                            </Typography>
                                        </Box>
                                        {a.is_class_teacher && (
                                            <Chip
                                                size="small"
                                                icon={<StarIcon sx={{ fontSize: 15, color: "#B45309 !important" }} />}
                                                label="Class teacher"
                                                sx={{ bgcolor: "#FEF3C7", color: "#92400E", fontWeight: 700 }}
                                            />
                                        )}
                                        <IconButton
                                            size="small"
                                            aria-label="Remove assignment"
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

                    {/* ---------- Add new ---------- */}
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: "1px solid var(--sl-border, #E2E8F0)",
                            bgcolor: "#fff",
                            boxShadow: "var(--sl-card-shadow, 0 1px 3px rgba(15,23,42,.06))",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.75
                        }}
                    >

                        <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.4, color: "text.secondary" }}>
                            ADD A NEW ASSIGNMENT
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

                        <Box>
                            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.75 }}>Section</Typography>
                            {!assignClassId && (
                                <Typography sx={{ fontSize: "0.84rem", color: "text.secondary" }}>Choose a class first.</Typography>
                            )}
                            {assignClassId && sections.length === 0 && (
                                <Typography sx={{ fontSize: "0.84rem", color: "#B45309" }}>This class has no sections yet.</Typography>
                            )}
                            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                                {sections.map((s) => {
                                    const on = assignSectionId === s.id;
                                    return (
                                        <Chip
                                            key={s.id}
                                            label={`Section ${s.section_name}`}
                                            onClick={() => setAssignSectionId(s.id)}
                                            sx={{
                                                fontWeight: 700,
                                                bgcolor: on ? "var(--sl-ink, var(--sl-ink))" : "var(--sl-soft, #F1F5F9)",
                                                color: on ? "#fff" : "var(--sl-ink, var(--sl-ink))",
                                                "&:hover": { bgcolor: on ? "var(--sl-ink, var(--sl-ink))" : "var(--sl-soft2, #E2E8F0)" }
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        </Box>

                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                p: 1.25,
                                borderRadius: 2.5,
                                bgcolor: isClassTeacher ? "#FEF3C7" : "var(--sl-page2, #F8FAFC)",
                                border: "1px solid var(--sl-border, #E2E8F0)"
                            }}
                        >
                            <StarIcon sx={{ color: isClassTeacher ? "#B45309" : "#94A3B8" }} />
                            <Box sx={{ flex: 1 }}>
                                <Typography sx={{ fontSize: "0.88rem", fontWeight: 700 }}>Class teacher of this section</Typography>
                                <Typography sx={{ fontSize: "0.76rem", color: "text.secondary" }}>
                                    Sends the daily greeting and sees this class first.
                                </Typography>
                            </Box>
                            <Switch checked={isClassTeacher} onChange={(e) => setIsClassTeacher(e.target.checked)} />
                        </Box>

                    </Box>

                </DialogContent>

                <DialogActions sx={{ px: 2.5, pb: 2, pt: 1 }}>

                    <Button onClick={() => setAssignDialogOpen(false)}>
                        Close
                    </Button>

                    <Button
                        loading={assigning}
                        loadingPosition="start"
                        variant="contained"
                        startIcon={<AddIcon />}
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
                        label="Username (optional)"
                        size="small"
                        fullWidth
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        helperText="Lets this teacher log in with a username instead of their email. Must be unique across all schools."
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

                    <Button loading={addingLogin} loadingPosition="start"
                        variant="contained"
                        onClick={handleAddLogin}
                        disabled={addingLogin}
                    >

                        {addingLogin ? "Adding..." : "Add Login"}

                    </Button>

                </DialogActions>

            </Dialog>

            <ResetPasswordDialog open={!!resetTeacher} userId={resetTeacher?.user_id} name={resetTeacher ? `${resetTeacher.first_name} ${resetTeacher.last_name}` : ""} onClose={() => setResetTeacher(null)} />

<Dialog open={usernameDialogOpen} onClose={() => setUsernameDialogOpen(false)} maxWidth="xs" fullWidth>

                <DialogTitle>

                    {usernameTeacher && usernameTeacher.username ? "Edit" : "Set"} Username for {usernameTeacher ? `${usernameTeacher.first_name} ${usernameTeacher.last_name}` : "Teacher"}

                </DialogTitle>

                <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>

                    {usernameError && <Alert severity="error">{usernameError}</Alert>}

                    {usernameSuccess && <Alert severity="success">{usernameSuccess}</Alert>}

                    <TextField
                        label="Username"
                        size="small"
                        fullWidth
                        value={usernameValue}
                        onChange={(e) => setUsernameValue(e.target.value)}
                        helperText="Lets this teacher log in with a username instead of email. Must be unique across all schools."
                    />

                </DialogContent>

                <DialogActions>

                    <Button onClick={() => setUsernameDialogOpen(false)}>

                        Close

                    </Button>

                    <Button loading={settingUsername} loadingPosition="start"
                        variant="contained"
                        onClick={handleSetUsername}
                        disabled={settingUsername}
                    >

                        {settingUsername ? "Saving..." : "Save"}

                    </Button>

                </DialogActions>

            </Dialog>

        </Box>

    );

}

export default TeachersPage;
