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

    Typography,

    Box,

    useMediaQuery,

    useTheme

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

    const theme = useTheme();

    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    if (isMobile) {

        return (

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>

                {students.map((student) => (

                    <Paper
                        key={student.id}
                        sx={{ borderRadius: 3, p: 1.75, border: "1px solid #EEF2F7" }}
                    >

                        <Stack direction="row" spacing={1.5} alignItems="center">

                            <StudentAvatar name={student.first_name} />

                            <Box sx={{ minWidth: 0, flex: 1 }}>

                                <Typography fontWeight={600} sx={{ overflowWrap: "anywhere" }}>
                                    {student.first_name} {student.last_name}
                                </Typography>

                                <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
                                    {student.admission_no}
                                    {student.class_name
                                        ? ` · ${student.class_name}${student.section_name ? ` - ${student.section_name}` : ""}`
                                        : ""}
                                    {student.gender ? ` · ${student.gender}` : ""}
                                </Typography>

                            </Box>

                            <StudentStatusChip active={student.is_active} />

                        </Stack>

                        <Stack direction="row" justifyContent="flex-end" sx={{ mt: 0.5 }}>

                            <IconButton color="default" onClick={() => onView(student)}>
                                <VisibilityIcon />
                            </IconButton>

                            <IconButton color="primary" onClick={() => onEdit(student)}>
                                <EditIcon />
                            </IconButton>

                            <IconButton
                                color={student.is_active ? "error" : "success"}
                                onClick={() => onDelete(student)}
                            >
                                {student.is_active ? <BlockIcon /> : <RestoreIcon />}
                            </IconButton>

                        </Stack>

                    </Paper>

                ))}

            </Box>

        );

    }

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
