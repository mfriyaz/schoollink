import { useEffect, useState } from "react";

import {
    Box,
    Button,
    Typography,
    Paper,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    TextField,
    IconButton,
    Tooltip
} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { getStudents } from "../../services/studentService";

import StudentForm from "../../components/Students/StudentForm";

function StudentListPage() {

    const [students, setStudents] = useState([]);

    const [search, setSearch] = useState("");

    const [openForm, setOpenForm] = useState(false);

    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {

        loadStudents();

    }, [search]);

    async function loadStudents() {

        try {

            const response = await getStudents(search);

            console.log("API Response:", response);

            if (response.success) {

                setStudents(response.data);

            }

        } catch (err) {

            console.error(err);

        }

    }

    return (

        <Box sx={{ p: 3 }}>

            {/* Header */}

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3
                }}
            >

                <Typography variant="h4">

                    Students

                </Typography>

                <Button
                    variant="contained"
                    onClick={() => {

                        setSelectedStudent(null);

                        setOpenForm(true);

                    }}
                >

                    Add Student

                </Button>

            </Box>

            {/* Search */}

            <Box
                sx={{
                    mb: 2
                }}
            >

                <TextField

                    fullWidth

                    label="Search Student"

                    placeholder="Admission No, Name, Parent Name, Mobile..."

                    value={search}

                    onChange={(e) => setSearch(e.target.value)}

                />

            </Box>

            {/* Table */}

            <TableContainer component={Paper}>

                <Table>

                    <TableHead>

                        <TableRow>

                            <TableCell><strong>ID</strong></TableCell>

                            <TableCell><strong>Name</strong></TableCell>

                            <TableCell><strong>Admission No</strong></TableCell>

                            <TableCell><strong>Gender</strong></TableCell>

                            <TableCell><strong>Parent</strong></TableCell>

                            <TableCell><strong>Mobile</strong></TableCell>

                            <TableCell><strong>Status</strong></TableCell>

                            <TableCell align="center">

                                <strong>Action</strong>

                            </TableCell>

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {

                            students.length === 0 ?

                                (

                                    <TableRow>

                                        <TableCell

                                            colSpan={8}

                                            align="center"

                                        >

                                            No students found.

                                        </TableCell>

                                    </TableRow>

                                )

                                :

                                students.map((student) => (

                                    <TableRow
                                        key={student.id}
                                        hover
                                    >

                                        <TableCell>

                                            {student.id}

                                        </TableCell>

                                        <TableCell>

                                            {student.first_name} {student.last_name}

                                        </TableCell>

                                        <TableCell>

                                            {student.admission_no}

                                        </TableCell>

                                        <TableCell>

                                            {student.gender}

                                        </TableCell>

                                        <TableCell>

                                            {student.father_name}

                                        </TableCell>

                                        <TableCell>

                                            {student.parent_phone}

                                        </TableCell>

                                        <TableCell>

                                            {

                                                student.is_active

                                                    ?

                                                    "🟢 Active"

                                                    :

                                                    "🔴 Inactive"

                                            }

                                        </TableCell>

                                        <TableCell align="center">

                                            <Tooltip title="Edit Student">

                                                <IconButton

                                                    color="primary"

                                                    onClick={() => {

                                                        setSelectedStudent(student);

                                                        setOpenForm(true);

                                                    }}

                                                >

                                                    <EditIcon />

                                                </IconButton>

                                            </Tooltip>

                                            <Tooltip title="Delete Student">

                                                <IconButton

                                                    color="error"

                                                    onClick={() => {

                                                        console.log("Delete Student:", student.id);

                                                    }}

                                                >

                                                    <DeleteIcon />

                                                </IconButton>

                                            </Tooltip>

                                        </TableCell>

                                    </TableRow>

                                ))

                        }

                    </TableBody>

                </Table>

            </TableContainer>

            {/* Student Form */}

            <StudentForm

                open={openForm}

                student={selectedStudent}

                onClose={() => {

                    setOpenForm(false);

                    setSelectedStudent(null);

                }}

                onSaved={loadStudents}

            />

        </Box>

    );

}

export default StudentListPage;