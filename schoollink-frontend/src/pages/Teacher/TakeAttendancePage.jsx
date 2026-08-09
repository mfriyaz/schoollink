import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    MenuItem,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";

import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";

import {
    getMyTeacherProfile,
    getMyAssignments,
    getAttendanceRoster,
    bulkMarkAttendance
} from "../../services/postService";

const statuses = [

    { value: "Present", icon: <CheckCircleIcon fontSize="small" />, color: "success" },

    { value: "Absent", icon: <CancelIcon fontSize="small" />, color: "error" },

    { value: "Late", icon: <AccessTimeIcon fontSize="small" />, color: "warning" }

];

function TakeAttendancePage() {

    const [assignments, setAssignments] = useState([]);

    const [teacherSubjectId, setTeacherSubjectId] = useState("");

    const [date, setDate] = useState(
        new Date().toISOString().slice(0, 10)
    );

    const [roster, setRoster] = useState([]);

    const [loadingAssignments, setLoadingAssignments] = useState(true);

    const [loadingRoster, setLoadingRoster] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    useEffect(() => {

        loadAssignments();

    }, []);

    useEffect(() => {

        if (teacherSubjectId && date) {

            loadRoster();

        }

    }, [teacherSubjectId, date]);

    async function loadAssignments() {

        try {

            const profileResponse = await getMyTeacherProfile();

            if (!profileResponse.success) {

                setError(profileResponse.message);

                return;

            }

            const assignmentsResponse = await getMyAssignments(
                profileResponse.data.id
            );

            if (assignmentsResponse.success) {

                setAssignments(assignmentsResponse.data);

                if (assignmentsResponse.data.length > 0) {

                    setTeacherSubjectId(
                        assignmentsResponse.data[0].teacher_subject_id
                    );

                }

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load your classes/subjects."
            );

        } finally {

            setLoadingAssignments(false);

        }

    }

    async function loadRoster() {

        setError("");

        setSuccess("");

        try {

            setLoadingRoster(true);

            const response = await getAttendanceRoster(teacherSubjectId, date);

            if (response.success) {

                setRoster(

                    response.data.map((s) => ({

                        ...s,

                        status: s.status || "Present"

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

    function setStudentStatus(studentId, status) {

        setRoster((list) =>

            list.map((s) =>
                s.student_id === studentId ? { ...s, status } : s
            )

        );

    }

    async function handleSave() {

        setError("");

        setSuccess("");

        try {

            setSaving(true);

            const response = await bulkMarkAttendance({

                teacher_subject_id: teacherSubjectId,

                attendance_date: date,

                records: roster.map((s) => ({

                    student_id: s.student_id,

                    status: s.status

                }))

            });

            if (response.success) {

                setSuccess("Attendance saved successfully.");

            } else {

                setError(response.message);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to save attendance."
            );

        } finally {

            setSaving(false);

        }

    }

    if (loadingAssignments) {

        return (

            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                <CircularProgress />

            </Box>

        );

    }

    const selectedAssignment = assignments.find(
        (a) => a.teacher_subject_id === teacherSubjectId
    );

    return (

        <Box sx={{ maxWidth: 720 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>

                <Box

                    sx={{

                        width: 40,

                        height: 40,

                        borderRadius: "10px",

                        bgcolor: "#FFEDD5",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center"

                    }}

                >

                    <FactCheckIcon sx={{ color: "#EA580C" }} />

                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>

                    Take Attendance

                </Typography>

            </Box>

            <Card sx={{ p: 3.5 }}>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {assignments.length === 0 ? (

                    <Alert severity="warning">

                        You don't have any classes/subjects assigned yet.
                        Please contact your School Admin.

                    </Alert>

                ) : (

                    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>

                        <TextField
                            select
                            label="Class / Subject"
                            value={teacherSubjectId}
                            onChange={(e) => setTeacherSubjectId(e.target.value)}
                            sx={{ minWidth: 260 }}
                        >

                            {assignments.map((a) => (

                                <MenuItem
                                    key={a.teacher_subject_id}
                                    value={a.teacher_subject_id}
                                >

                                    {a.class_name} - {a.section_name} · {a.subject_name}

                                </MenuItem>

                            ))}

                        </TextField>

                        <TextField
                            label="Date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            InputLabelProps={{ shrink: true }}
                        />

                    </Box>

                )}

                {loadingRoster && (

                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>

                        <CircularProgress size={28} />

                    </Box>

                )}

                {!loadingRoster && selectedAssignment && roster.length === 0 && (

                    <Typography color="text.secondary">

                        No students found in this class/section.

                    </Typography>

                )}

                {!loadingRoster && roster.map((student) => (

                    <Box

                        key={student.student_id}

                        sx={{

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "space-between",

                            py: 1.5,

                            borderBottom: "1px solid #F1F5F9",

                            "&:last-of-type": { borderBottom: "none" }

                        }}

                    >

                        <Box>

                            <Typography sx={{ fontWeight: 600 }}>

                                {student.first_name} {student.last_name}

                            </Typography>

                            <Typography sx={{ color: "#64748B", fontSize: "0.8rem" }}>

                                {student.admission_no}

                            </Typography>

                        </Box>

                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={student.status}
                            onChange={(e, value) => {

                                if (value) {

                                    setStudentStatus(student.student_id, value);

                                }

                            }}
                        >

                            {statuses.map((s) => (

                                <ToggleButton
                                    key={s.value}
                                    value={s.value}
                                    color={s.color}
                                >

                                    {s.icon}

                                </ToggleButton>

                            ))}

                        </ToggleButtonGroup>

                    </Box>

                ))}

                {roster.length > 0 && (

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>

                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving}
                        >

                            {saving ? "Saving..." : "Save Attendance"}

                        </Button>

                    </Box>

                )}

            </Card>

        </Box>

    );

}

export default TakeAttendancePage;
