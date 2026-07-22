import {

Card,
CardContent,
Typography,
Table,
TableHead,
TableRow,
TableCell,
TableBody

} from "@mui/material";

function RecentStudents({ students = [] }) {

    return (

        <Card>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >

                    Recently Added Students

                </Typography>

                <Table size="small">

                    <TableHead>

                        <TableRow>

                            <TableCell>Name</TableCell>

                            <TableCell>Admission No</TableCell>

                            <TableCell>Class</TableCell>

                        </TableRow>

                    </TableHead>

                    <TableBody>

                        {

                            students.length === 0 ?

                                (

                                    <TableRow>

                                        <TableCell colSpan={3}>

                                            No records

                                        </TableCell>

                                    </TableRow>

                                )

                                :

                                students.map(student => (

                                    <TableRow key={student.id}>

                                        <TableCell>

                                            {student.first_name} {student.last_name}

                                        </TableCell>

                                        <TableCell>

                                            {student.admission_no}

                                        </TableCell>

                                        <TableCell>

                                            {student.class_name || "-"}

                                        </TableCell>

                                    </TableRow>

                                ))

                        }

                    </TableBody>

                </Table>

            </CardContent>

        </Card>

    );

}

export default RecentStudents;