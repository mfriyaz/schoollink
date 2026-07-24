import {
    Paper,
    Typography,
    Button,
    Stack,
    Box
} from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PaymentsIcon from "@mui/icons-material/Payments";

function HeroCard() {

    const hour = new Date().getHours();

    let greeting = "Good Evening";

    if (hour < 12) greeting = "Good Morning";
    else if (hour < 17) greeting = "Good Afternoon";

    const today = new Date().toLocaleDateString("en-SG", {

        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"

    });

    return (

        <Paper

            sx={{

                p: 5,

                borderRadius: 5,

                mb: 4,

                background:
                    "linear-gradient(135deg,#2563EB,#4F46E5)",

                color: "#fff",

                overflow: "hidden",

                position: "relative"

            }}

        >

            <Typography
                variant="h4"
                fontWeight={700}
            >

                {greeting}, Riyaz 👋

            </Typography>

            <Typography
                sx={{
                    opacity: .85,
                    mt: 1
                }}
            >

                {today}

            </Typography>

            <Typography
                sx={{
                    mt: 2,
                    maxWidth: 600
                }}
            >

                Welcome back to SchoolLink ERP.

                Manage students, teachers, attendance,

                homework and school operations in one place.

            </Typography>

            <Stack
                direction="row"
                spacing={2}
                mt={4}
            >

                <Button

                    startIcon={<PersonAddIcon />}

                    variant="contained"

                    sx={{

                        bgcolor: "#fff",

                        color: "#2563EB",

                        "&:hover": {

                            bgcolor: "#F3F4F6"

                        }

                    }}

                >

                    Add Student

                </Button>

                <Button

                    startIcon={<AssignmentTurnedInIcon />}

                    variant="outlined"

                    sx={{

                        color: "#fff",

                        borderColor: "#fff"

                    }}

                >

                    Attendance

                </Button>

                <Button

                    startIcon={<PaymentsIcon />}

                    variant="outlined"

                    sx={{

                        color: "#fff",

                        borderColor: "#fff"

                    }}

                >

                    Collect Fees

                </Button>

            </Stack>

        </Paper>

    );

}

export default HeroCard;