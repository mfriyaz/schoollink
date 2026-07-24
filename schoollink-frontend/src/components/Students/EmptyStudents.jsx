import { Paper, Typography } from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";

export default function EmptyStudents() {

    return (

        <Paper

            sx={{

                p: 8,

                borderRadius: 4,

                textAlign: "center"

            }}

        >

            <SchoolIcon

                sx={{

                    fontSize: 80,

                    color: "#CBD5E1"

                }}

            />

            <Typography
                variant="h5"
                mt={2}
                fontWeight={700}
            >
                No Students Found
            </Typography>

            <Typography color="text.secondary">

                Start by adding your first student.

            </Typography>

        </Paper>

    );

}