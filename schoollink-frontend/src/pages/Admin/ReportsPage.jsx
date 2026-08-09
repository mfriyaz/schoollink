import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    MenuItem,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TextField,
    Typography
} from "@mui/material";

import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";

import { getStudents } from "../../services/studentService";
import { getAllExams } from "../../services/examService";
import {
    getReportCard,
    downloadReportCardPdf
} from "../../services/reportCardService";

function ReportsPage() {

    const [students, setStudents] = useState([]);

    const [exams, setExams] = useState([]);

    const [studentId, setStudentId] = useState("");

    const [examId, setExamId] = useState("");

    const [loadingOptions, setLoadingOptions] = useState(true);

    const [loadingReport, setLoadingReport] = useState(false);

    const [downloading, setDownloading] = useState(false);

    const [report, setReport] = useState(null);

    const [error, setError] = useState("");

    useEffect(() => {

        loadOptions();

    }, []);

    async function loadOptions() {

        try {

            const [studentsResponse, examsResponse] = await Promise.all([

                getStudents(),

                getAllExams()

            ]);

            if (studentsResponse.success) {

                setStudents(studentsResponse.data);

            }

            if (examsResponse.success) {

                setExams(examsResponse.data);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load students/exams."
            );

        } finally {

            setLoadingOptions(false);

        }

    }

    async function handleViewReport() {

        setError("");

        setReport(null);

        if (!studentId || !examId) {

            setError("Please select a Student and an Exam.");

            return;

        }

        try {

            setLoadingReport(true);

            const response = await getReportCard(studentId, examId);

            if (response.success) {

                setReport(response);

            } else {

                setError(response.message);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load this report card."
            );

        } finally {

            setLoadingReport(false);

        }

    }

    async function handleDownloadPdf() {

        setError("");

        try {

            setDownloading(true);

            const blob = await downloadReportCardPdf(studentId, examId);

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;

            link.download = `report-card-${report.student.admission_no}.pdf`;

            document.body.appendChild(link);

            link.click();

            link.remove();

            window.URL.revokeObjectURL(url);

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to download the PDF."
            );

        } finally {

            setDownloading(false);

        }

    }

    if (loadingOptions) {

        return (

            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                <CircularProgress />

            </Box>

        );

    }

    return (

        <Box sx={{ maxWidth: 800 }}>

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

                    <DescriptionIcon sx={{ color: "#7C3AED" }} />

                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>

                    Reports

                </Typography>

            </Box>

            <Card sx={{ p: 3.5, mb: 3 }}>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>

                    <TextField
                        select
                        label="Student"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        sx={{ minWidth: 240 }}
                    >

                        {students.map((s) => (

                            <MenuItem key={s.id} value={s.id}>

                                {s.first_name} {s.last_name} ({s.admission_no})

                            </MenuItem>

                        ))}

                    </TextField>

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

                    <Button
                        variant="contained"
                        onClick={handleViewReport}
                        disabled={loadingReport}
                    >

                        {loadingReport ? "Loading..." : "View Report Card"}

                    </Button>

                </Box>

            </Card>

            {report && (

                <Card sx={{ p: 3.5 }}>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>

                        <Box>

                            <Typography variant="h6" sx={{ fontWeight: 700 }}>

                                {report.student.name}

                            </Typography>

                            <Typography sx={{ color: "#64748B", fontSize: "0.88rem" }}>

                                {report.student.admission_no} · {report.student.class} - {report.student.section} · {report.exam}

                            </Typography>

                        </Box>

                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleDownloadPdf}
                            disabled={downloading}
                        >

                            {downloading ? "Downloading..." : "Download PDF"}

                        </Button>

                    </Box>

                    <Table size="small" sx={{ mb: 2 }}>

                        <TableHead>

                            <TableRow>

                                <TableCell>Subject</TableCell>

                                <TableCell align="right">Marks</TableCell>

                                <TableCell align="right">Max</TableCell>

                                <TableCell align="right">%</TableCell>

                                <TableCell align="center">Grade</TableCell>

                            </TableRow>

                        </TableHead>

                        <TableBody>

                            {report.subjects.map((s, i) => (

                                <TableRow key={i}>

                                    <TableCell>{s.subject_name}</TableCell>

                                    <TableCell align="right">{s.marks_obtained}</TableCell>

                                    <TableCell align="right">{s.max_marks}</TableCell>

                                    <TableCell align="right">{s.percentage}%</TableCell>

                                    <TableCell align="center">

                                        <Chip
                                            size="small"
                                            color={s.result === "Pass" ? "success" : "error"}
                                            label={s.grade_name}
                                        />

                                    </TableCell>

                                </TableRow>

                            ))}

                        </TableBody>

                    </Table>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 3, pt: 2, borderTop: "1px solid #F1F5F9" }}>

                        <Typography sx={{ fontWeight: 600 }}>

                            Total: {report.summary.total_marks} / {report.summary.maximum_marks}

                        </Typography>

                        <Typography sx={{ fontWeight: 600 }}>

                            Overall: {report.summary.percentage}%

                        </Typography>

                    </Box>

                </Card>

            )}

        </Box>

    );

}

export default ReportsPage;
