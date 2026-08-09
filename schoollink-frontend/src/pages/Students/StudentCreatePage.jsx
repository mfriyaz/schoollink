import { Box, Typography, Breadcrumbs, Link } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

import StudentForm from "../../components/Students/StudentForm";

function StudentCreatePage() {

    return (

        <Box>

            <Breadcrumbs sx={{ mb: 2 }}>

                <Link
                    component={RouterLink}
                    underline="hover"
                    color="inherit"
                    to="/dashboard"
                >
                    Dashboard
                </Link>

                <Link
                    component={RouterLink}
                    underline="hover"
                    color="inherit"
                    to="/students"
                >
                    Students
                </Link>

                <Typography color="text.primary">

                    Add Student

                </Typography>

            </Breadcrumbs>

            <Typography
                variant="h4"
                fontWeight={700}
                sx={{ mb: 3 }}
            >

                Student Registration

            </Typography>

            <StudentForm />

        </Box>

    );

}

export default StudentCreatePage;