import {

    Table,

    TableHead,

    TableBody,

    TableRow,

    TableCell,

    Paper,

    IconButton,

    Stack,

    Typography

} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import StudentAvatar from "./StudentAvatar";
import StudentStatusChip from "./StudentStatusChip";

export default function StudentTable({

    students,

    onEdit,

    onDelete

}) {

    return (

        <Paper

            sx={{

                borderRadius: 4,

                overflow: "hidden"

            }}

        >

            <Table>

                <TableHead>

                    <TableRow>

                        <TableCell>Student</TableCell>

                        <TableCell>Admission No</TableCell>

                        <TableCell>Gender</TableCell>

                        <TableCell>Status</TableCell>

                        <TableCell align="center">

                            Actions

                        </TableCell>

                    </TableRow>

                </TableHead>

                <TableBody>

                    {

                        students.map(student => (

                            <TableRow

                                key={student.id}

                                hover

                            >

                                <TableCell>

                                    <Stack

                                        direction="row"

                                        spacing={2}

                                        alignItems="center"

                                    >

                                        <StudentAvatar

                                            name={student.first_name}

                                        />

                                        <Typography

                                            fontWeight={600}

                                        >

                                            {student.first_name} {student.last_name}

                                        </Typography>

                                    </Stack>

                                </TableCell>

                                <TableCell>

                                    {student.admission_no}

                                </TableCell>

                                <TableCell>

                                    {student.gender}

                                </TableCell>

                                <TableCell>

                                    <StudentStatusChip

                                        active={student.is_active}

                                    />

                                </TableCell>

                                <TableCell align="center">

                                    <IconButton

                                        color="primary"

                                        onClick={() =>

                                            onEdit(student)

                                        }

                                    >

                                        <EditIcon />

                                    </IconButton>

                                    <IconButton

                                        color="error"

                                        onClick={() =>

                                            onDelete(student)

                                        }

                                    >

                                        <DeleteIcon />

                                    </IconButton>

                                </TableCell>

                            </TableRow>

                        ))

                    }

                </TableBody>

            </Table>

        </Paper>

    );

}