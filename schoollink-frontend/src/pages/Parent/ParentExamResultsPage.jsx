import { useEffect, useState } from "react";

import {
    Box,
    Card,
    Chip,
    CircularProgress,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";

import { getMyChildren } from "../../services/postService";

import { getMarksForStudent } from "../../services/examService";

function ParentExamResultsPage() {

    const [children, setChildren] = useState([]);

    const [selectedStudentId, setSelectedStudentId] = useState("");

    const [marks, setMarks] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadChildren();

    }, []);

    async function loadChildren() {

        try {

            const response = await getMyChildren();

            if (response.success && response.data.length > 0) {

                setChildren(response.data);

                setSelectedStudentId(response.data[0].student_id);

                await loadMarks(response.data[0].student_id);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    async function loadMarks(studentId) {

        try {

            const response = await getMarksForStudent(studentId);

            if (response.success) {

                setMarks(response.data);

            }

        } catch (err) {

            console.error(err);

        }

    }

    async function handleChildChange(studentId) {

        setSelectedStudentId(studentId);

        setLoading(true);

        await loadMarks(studentId);

        setLoading(false);

    }

    // Group by exam name so results read as one exam at a time
    const marksByExam = marks.reduce((groups, mark) => {

        if (!groups[mark.exam_name]) {

            groups[mark.exam_name] = [];

        }

        groups[mark.exam_name].push(mark);

        return groups;

    }, {});

    return (

        <Box sx={{ maxWidth: 700 }}>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

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

                        Exam Results

                    </Typography>

                </Box>

                {children.length > 1 && (

                    <TextField
                        select
                        size="small"
                        value={selectedStudentId}
                        onChange={(e) => handleChildChange(e.target.value)}
                        sx={{ minWidth: 180 }}
                    >

                        {children.map((c) => (

                            <MenuItem key={c.student_id} value={c.student_id}>{c.first_name} {c.last_name}</MenuItem>

                        ))}

                    </TextField>

                )}

            </Box>

            {loading && (

                <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                    <CircularProgress />

                </Box>

            )}

            {!loading && marks.length === 0 && (

                <Card sx={{ p: 3 }}>

                    <Typography color="text.secondary">

                        No exam results published yet.

                    </Typography>

                </Card>

            )}

            {!loading && Object.entries(marksByExam).map(([examName, examMarks]) => (

                <Card key={examName} sx={{ p: 3, mb: 3 }}>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>

                        {examName}

                    </Typography>

                    {examMarks.map((mark) => (

                        <Box

                            key={mark.id}

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

                                    {mark.subject_name}

                                </Typography>

                                <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>

                                    {mark.marks_obtained} marks ({mark.percentage}%)

                                </Typography>

                            </Box>

                            <Chip
                                size="small"
                                color={mark.result === "Pass" ? "success" : "error"}
                                label={mark.grade_name}
                                sx={{ fontWeight: 600 }}
                            />

                        </Box>

                    ))}

                </Card>

            ))}

        </Box>

    );

}

export default ParentExamResultsPage;
