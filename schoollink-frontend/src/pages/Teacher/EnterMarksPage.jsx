import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import GradeIcon from "@mui/icons-material/GradeOutlined";

import {
    getMyTeacherProfile,
    getMyAssignments
} from "../../services/postService";

import {
    getAllExams,
    getSubjectsByExam,
    getMarksRoster,
    bulkSaveMarks
} from "../../services/examService";

function EnterMarksPage() {

    const [exams, setExams] = useState([]);

    const [examId, setExamId] = useState("");

    const [myAssignments, setMyAssignments] = useState([]);

    const [examSubjects, setExamSubjects] = useState([]);

    const [examSubjectId, setExamSubjectId] = useState("");

    const [roster, setRoster] = useState([]);

    const [maxMarks, setMaxMarks] = useState(0);

    const [loading, setLoading] = useState(true);

    const [loadingRoster, setLoadingRoster] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    useEffect(() => {

        loadInitial();

    }, []);

    useEffect(() => {

        if (examId) {

            loadExamSubjects();

        }

    }, [examId]);

    useEffect(() => {

        if (examSubjectId) {

            loadRoster();

        }

    }, [examSubjectId]);

    async function loadInitial() {

        try {

            const profileResponse = await getMyTeacherProfile();

            if (!profileResponse.success) {

                setError(profileResponse.message);

                return;

            }

            const [examsResponse, assignmentsResponse] = await Promise.all([

                getAllExams(),

                getMyAssignments(profileResponse.data.id)

            ]);

            if (examsResponse.success) {

                setExams(examsResponse.data);

                if (examsResponse.data.length > 0) {

                    setExamId(examsResponse.data[0].id);

                }

            }

            if (assignmentsResponse.success) {

                setMyAssignments(assignmentsResponse.data);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load exams."
            );

        } finally {

            setLoading(false);

        }

    }

    async function loadExamSubjects() {

        setError("");

        try {

            const response = await getSubjectsByExam(examId);

            if (response.success) {

                // Only show subjects that belong to THIS teacher's
                // own class/subject assignments.
                const myTeacherSubjectIds = myAssignments.map(
                    (a) => a.teacher_subject_id
                );

                const mine = response.data.filter((es) =>
                    myTeacherSubjectIds.includes(es.teacher_subject_id)
                );

                setExamSubjects(mine);

                setExamSubjectId(mine.length > 0 ? mine[0].id : "");

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load subjects for this exam."
            );

        }

    }

    async function loadRoster() {

        setError("");

        setSuccess("");

        try {

            setLoadingRoster(true);

            const selectedExamSubject = examSubjects.find(
                (es) => es.id === examSubjectId
            );

            setMaxMarks(selectedExamSubject ? selectedExamSubject.max_marks : 0);

            const response = await getMarksRoster(examSubjectId);

            if (response.success) {

                setRoster(

                    response.data.map((s) => ({

                        ...s,

                        marks_obtained: s.marks_obtained ?? ""

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

    function setStudentMarks(studentId, value) {

        setRoster((list) =>

            list.map((s) =>
                s.student_id === studentId ? { ...s, marks_obtained: value } : s
            )

        );

    }

    async function handleSave() {

        setError("");

        setSuccess("");

        const invalid = roster.find((s) =>
            s.marks_obtained !== "" &&
            (Number(s.marks_obtained) < 0 || Number(s.marks_obtained) > Number(maxMarks))
        );

        if (invalid) {

            setError(`Marks must be between 0 and ${maxMarks}.`);

            return;

        }

        try {

            setSaving(true);

            const response = await bulkSaveMarks({

                exam_subject_id: examSubjectId,

                records: roster

                    .filter((s) => s.marks_obtained !== "")

                    .map((s) => ({

                        student_id: s.student_id,

                        marks_obtained: s.marks_obtained

                    }))

            });

            if (response.success) {

                setSuccess("Marks saved successfully.");

                await loadRoster();

            } else {

                setError(response.message);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to save marks."
            );

        } finally {

            setSaving(false);

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

        <Box sx={{ maxWidth: 720 }}>

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

                    <GradeIcon sx={{ color: "#7C3AED" }} />

                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>

                    Enter Marks

                </Typography>

            </Box>

            <Card sx={{ p: 3.5 }}>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                {exams.length === 0 ? (

                    <Alert severity="warning">No exams have been created yet.</Alert>

                ) : (

                    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>

                        <TextField
                            select
                            label="Exam"
                            value={examId}
                            onChange={(e) => setExamId(e.target.value)}
                            sx={{ minWidth: 220 }}
                        >

                            {exams.map((e) => (

                                <MenuItem key={e.id} value={e.id}>{e.exam_name}</MenuItem>

                            ))}

                        </TextField>

                        {examSubjects.length > 0 && (

                            <TextField
                                select
                                label="Subject"
                                value={examSubjectId}
                                onChange={(e) => setExamSubjectId(e.target.value)}
                                sx={{ minWidth: 220 }}
                            >

                                {examSubjects.map((es) => {

                                    const assignment = myAssignments.find(
                                        (a) => a.teacher_subject_id === es.teacher_subject_id
                                    );

                                    return (

                                        <MenuItem key={es.id} value={es.id}>

                                            {assignment
                                                ? `${assignment.class_name} - ${assignment.section_name} · ${assignment.subject_name}`
                                                : `Subject #${es.id}`}

                                        </MenuItem>

                                    );

                                })}

                            </TextField>

                        )}

                    </Box>

                )}

                {examId && examSubjects.length === 0 && (

                    <Typography color="text.secondary">

                        You don't have any of your classes assigned to this exam yet.
                        Ask your School Admin to assign one.

                    </Typography>

                )}

                {loadingRoster && (

                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>

                        <CircularProgress size={28} />

                    </Box>

                )}

                {!loadingRoster && roster.length > 0 && (

                    <>

                        <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 1 }}>

                            Max Marks: {maxMarks}

                        </Typography>

                        {roster.map((student) => (

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
                                        {student.grade_name && ` · Grade: ${student.grade_name}`}

                                    </Typography>

                                </Box>

                                <TextField
                                    type="number"
                                    size="small"
                                    value={student.marks_obtained}
                                    onChange={(e) => setStudentMarks(
                                        student.student_id,
                                        e.target.value
                                    )}
                                    sx={{ width: 100 }}
                                    inputProps={{ min: 0, max: maxMarks }}
                                />

                            </Box>

                        ))}

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>

                            <Button
                                variant="contained"
                                onClick={handleSave}
                                disabled={saving}
                            >

                                {saving ? "Saving..." : "Save Marks"}

                            </Button>

                        </Box>

                    </>

                )}

            </Card>

        </Box>

    );

}

export default EnterMarksPage;
