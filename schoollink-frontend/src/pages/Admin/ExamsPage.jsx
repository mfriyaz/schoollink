import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Grid,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";

import SchoolDatePicker from "../../components/common/SchoolDatePicker";

import {
    createExam,
    getAllExams,
    assignSubjectToExam,
    getSubjectsByExam,
    getSchoolAssignments
} from "../../services/examService";

function ExamsPage() {

    const [exams, setExams] = useState([]);

    const [assignments, setAssignments] = useState([]);

    const [loading, setLoading] = useState(true);

    // Create exam form
    const [examName, setExamName] = useState("");

    const [startDate, setStartDate] = useState("");

    const [endDate, setEndDate] = useState("");

    const [creatingExam, setCreatingExam] = useState(false);

    const [examError, setExamError] = useState("");

    // Selected exam + its assigned subjects
    const [selectedExamId, setSelectedExamId] = useState("");

    const [examSubjects, setExamSubjects] = useState([]);

    const [loadingSubjects, setLoadingSubjects] = useState(false);

    // Assign subject form
    const [teacherSubjectId, setTeacherSubjectId] = useState("");

    const [maxMarks, setMaxMarks] = useState("100");

    const [passMarks, setPassMarks] = useState("35");

    const [assigning, setAssigning] = useState(false);

    const [assignError, setAssignError] = useState("");

    useEffect(() => {

        loadInitial();

    }, []);

    useEffect(() => {

        if (selectedExamId) {

            loadExamSubjects(selectedExamId);

        }

    }, [selectedExamId]);

    async function loadInitial() {

        try {

            const [examsResponse, assignmentsResponse] = await Promise.all([

                getAllExams(),

                getSchoolAssignments()

            ]);

            if (examsResponse.success) {

                setExams(examsResponse.data);

                if (examsResponse.data.length > 0) {

                    setSelectedExamId(examsResponse.data[0].id);

                }

            }

            if (assignmentsResponse.success) {

                setAssignments(assignmentsResponse.data);

                if (assignmentsResponse.data.length > 0) {

                    setTeacherSubjectId(
                        assignmentsResponse.data[0].id
                    );

                }

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    async function loadExamSubjects(examId) {

        try {

            setLoadingSubjects(true);

            const response = await getSubjectsByExam(examId);

            if (response.success) {

                setExamSubjects(response.data);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoadingSubjects(false);

        }

    }

    async function handleCreateExam() {

        setExamError("");

        if (!examName || !startDate || !endDate) {

            setExamError("Please fill in Exam Name, Start Date and End Date.");

            return;

        }

        try {

            setCreatingExam(true);

            const response = await createExam({

                exam_name: examName,

                start_date: startDate,

                end_date: endDate,

                academic_year_id: 1

            });

            if (response.success) {

                setExamName("");

                setStartDate("");

                setEndDate("");

                const examsResponse = await getAllExams();

                if (examsResponse.success) {

                    setExams(examsResponse.data);

                    setSelectedExamId(response.data.id);

                }

            } else {

                setExamError(response.message);

            }

        } catch (err) {

            setExamError(
                err.response?.data?.message ||
                "Unable to create exam."
            );

        } finally {

            setCreatingExam(false);

        }

    }

    async function handleAssignSubject() {

        setAssignError("");

        if (!selectedExamId || !teacherSubjectId || !maxMarks || !passMarks) {

            setAssignError("Please fill in all fields.");

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

            } else {

                setAssignError(response.message);

            }

        } catch (err) {

            setAssignError(
                err.response?.data?.message ||
                "Unable to assign subject."
            );

        } finally {

            setAssigning(false);

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

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>

                <Box

                    sx={{

                        width: 40,

                        height: 40,

                        borderRadius: "10px",

                        bgcolor: "#EDE9FE",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center"

                    }}

                >

                    <AssessmentIcon sx={{ color: "#7C3AED" }} />

                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>

                    Exams

                </Typography>

            </Box>

            <Grid container spacing={3}>

                <Grid size={{ xs: 12, md: 5 }}>

                    <Card sx={{ p: 3, mb: 3 }}>

                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>

                            Create Exam

                        </Typography>

                        {examError && <Alert severity="error" sx={{ mb: 2 }}>{examError}</Alert>}

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

                            <TextField
                                label="Exam Name"
                                placeholder="e.g. Mid Term 2026"
                                value={examName}
                                onChange={(e) => setExamName(e.target.value)}
                                fullWidth
                            />

                            <SchoolDatePicker
                                label="Start Date"
                                value={startDate}
                                onChange={setStartDate}
                                fullWidth
                            />

                            <SchoolDatePicker
                                label="End Date"
                                value={endDate}
                                onChange={setEndDate}
                                fullWidth
                            />

                            <Button
                                variant="contained"
                                onClick={handleCreateExam}
                                disabled={creatingExam}
                            >

                                {creatingExam ? "Creating..." : "Create Exam"}

                            </Button>

                        </Box>

                    </Card>

                    <Card sx={{ p: 3 }}>

                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>

                            Assign Subject To Exam

                        </Typography>

                        {assignError && <Alert severity="error" sx={{ mb: 2 }}>{assignError}</Alert>}

                        {exams.length === 0 ? (

                            <Typography color="text.secondary">

                                Create an exam first.

                            </Typography>

                        ) : (

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

                                <TextField
                                    select
                                    label="Exam"
                                    value={selectedExamId}
                                    onChange={(e) => setSelectedExamId(e.target.value)}
                                    fullWidth
                                >

                                    {exams.map((e) => (

                                        <MenuItem key={e.id} value={e.id}>{e.exam_name}</MenuItem>

                                    ))}

                                </TextField>

                                <TextField
                                    select
                                    label="Class / Subject"
                                    value={teacherSubjectId}
                                    onChange={(e) => setTeacherSubjectId(e.target.value)}
                                    fullWidth
                                >

                                    {assignments.map((a) => (

                                        <MenuItem key={a.id} value={a.id}>

                                            {a.class_name} - {a.section_name} · {a.subject_name}

                                        </MenuItem>

                                    ))}

                                </TextField>

                                <Box sx={{ display: "flex", gap: 2 }}>

                                    <TextField
                                        label="Max Marks"
                                        type="number"
                                        value={maxMarks}
                                        onChange={(e) => setMaxMarks(e.target.value)}
                                        fullWidth
                                    />

                                    <TextField
                                        label="Pass Marks"
                                        type="number"
                                        value={passMarks}
                                        onChange={(e) => setPassMarks(e.target.value)}
                                        fullWidth
                                    />

                                </Box>

                                <Button
                                    variant="contained"
                                    onClick={handleAssignSubject}
                                    disabled={assigning}
                                >

                                    {assigning ? "Assigning..." : "Assign Subject"}

                                </Button>

                            </Box>

                        )}

                    </Card>

                </Grid>

                <Grid size={{ xs: 12, md: 7 }}>

                    <Card sx={{ p: 3 }}>

                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>

                            Subjects In This Exam

                        </Typography>

                        {loadingSubjects && (

                            <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>

                                <CircularProgress size={24} />

                            </Box>

                        )}

                        {!loadingSubjects && examSubjects.length === 0 && (

                            <Typography color="text.secondary">

                                No subjects assigned yet.

                            </Typography>

                        )}

                        {!loadingSubjects && examSubjects.map((es) => {

                            const assignment = assignments.find(
                                (a) => a.id === es.teacher_subject_id
                            );

                            return (

                                <Box

                                    key={es.id}

                                    sx={{

                                        display: "flex",

                                        justifyContent: "space-between",

                                        alignItems: "center",

                                        py: 1.5,

                                        borderBottom: "1px solid #F1F5F9",

                                        "&:last-of-type": { borderBottom: "none" }

                                    }}

                                >

                                    <Typography sx={{ fontWeight: 500 }}>

                                        {assignment
                                            ? `${assignment.class_name} - ${assignment.section_name} · ${assignment.subject_name}`
                                            : `Teacher-Subject #${es.teacher_subject_id}`}

                                    </Typography>

                                    <Chip
                                        size="small"
                                        label={`Max ${es.max_marks} · Pass ${es.pass_marks}`}
                                    />

                                </Box>

                            );

                        })}

                    </Card>

                </Grid>

            </Grid>

        </Box>

    );

}

export default ExamsPage;
