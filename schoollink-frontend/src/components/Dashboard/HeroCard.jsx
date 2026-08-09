import {
    Paper,
    Typography,
    Button,
    Stack
} from "@mui/material";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PaymentsIcon from "@mui/icons-material/Payments";

function HeroCard() {

    const hour = new Date().getHours();

    let greeting = "Good Evening";

    if (hour < 12) {
        greeting = "Good Morning";
    } else if (hour < 17) {
        greeting = "Good Afternoon";
    }

    const today = new Date().toLocaleDateString("en-SG", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    return (

        <Paper
            elevation={0}
            sx={{
                p: { xs: 3, md: 5 },
                mb: 4,
                borderRadius: 5,
                color: "#FFFFFF",
                background: "linear-gradient(135deg,#2563EB,#4F46E5)",
                boxShadow: "0 15px 35px rgba(37,99,235,.25)"
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
                    mt: 1,
                    opacity: 0.9
                }}
            >
                {today}
            </Typography>

            <Typography
                sx={{
                    mt: 2,
                    maxWidth: 700,
                    lineHeight: 1.7
                }}
            >
                Welcome back to <strong>SchoolLink ERP</strong>.
                Manage students, teachers, attendance,
                fees, homework and school operations
                from one modern dashboard.
            </Typography>

            <Stack
                direction={{
                    xs: "column",
                    sm: "row"
                }}
                spacing={2}
                mt={4}
            >

                <Button
                    variant="contained"
                    size="large"
                    startIcon={<PersonAddIcon />}
                    sx={{
                        bgcolor: "#FFFFFF",
                        color: "#2563EB",
                        fontWeight: 700,
                        "&:hover": {
                            bgcolor: "#F3F4F6"
                        }
                    }}
                >
                    Add Student
                </Button>

                <Button
                    variant="outlined"
                    size="large"
                    startIcon={<AssignmentTurnedInIcon />}
                    sx={{
                        color: "#FFFFFF",
                        borderColor: "#FFFFFF",
                        fontWeight: 700,
                        "&:hover": {
                            borderColor: "#FFFFFF",
                            bgcolor: "rgba(255,255,255,.12)"
                        }
                    }}
                >
                    Attendance
                </Button>

                <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PaymentsIcon />}
                    sx={{
                        color: "#FFFFFF",
                        borderColor: "#FFFFFF",
                        fontWeight: 700,
                        "&:hover": {
                            borderColor: "#FFFFFF",
                            bgcolor: "rgba(255,255,255,.12)"
                        }
                    }}
                >
                    Collect Fees
                </Button>

            </Stack>

        </Paper>

    );

}

export default HeroCard;
