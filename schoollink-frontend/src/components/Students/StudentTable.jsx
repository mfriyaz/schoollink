import {

    Table,

    TableContainer,

    TableHead,

    TableBody,

    TableRow,

    TableCell,

    Paper,

    IconButton,

    Stack,

    Tooltip,

    Typography

} from "@mui/material";

import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import RestoreIcon from "@mui/icons-material/RestoreOutlined";

import StudentAvatar from "./StudentAvatar";
import StudentStatusChip from "./StudentStatusChip";

export default function StudentTable({

    students,

    onView,

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

            <TableContainer sx={{ overflowX: "auto" }}>

                <Table>

                <TableHead>

                    <TableRow>

                        <TableCell>Student</TableCell>

                        <TableCell>Admission No</TableCell>

                        <TableCell>Class</TableCell>

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

                                    {student.class_name
                                        ? `${student.class_name}${student.section_name ? ` - ${student.section_name}` : ""}`
                                        : "-"}

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

                                    <Tooltip title="View Details">

                                        <IconButton

                                            color="default"

                                            onClick={() =>
                                                onView(student)
                                            }

                                        >

                                            <VisibilityIcon />

                                        </IconButton>

                                    </Tooltip>

                                    <Tooltip title="Edit">

                                        <IconButton

                                            color="primary"

                                            onClick={() =>
                                                onEdit(student)
                                            }

                                        >

                                            <EditIcon />

                                        </IconButton>

                                    </Tooltip>

                                    {student.is_active ? (

                                        <Tooltip title="Deactivate">

                                            <IconButton

                                                color="error"

                                                onClick={() =>
                                                    onDelete(student)
                                                }

                                            >

                                                <BlockIcon />

                                            </IconButton>

                                        </Tooltip>

                                    ) : (

                                        <Tooltip title="Reactivate">

                                            <IconButton

                                                color="success"

                                                onClick={() =>
                                                    onDelete(student)
                                                }

                                            >

                                                <RestoreIcon />

                                            </IconButton>

                                        </Tooltip>

                                    )}

                                </TableCell>

                            </TableRow>

                        ))

                    }

                </TableBody>

            </Table>

            </TableContainer>

        </Paper>

    );

}
