import {
    Paper,
    Typography
} from "@mui/material";

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
                p: { xs: 2.5, md: 5 },
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
                sx={{ fontSize: { xs: "1.5rem", md: "2.125rem" } }}
            >
                {greeting}, Riyaz 👋
            </Typography>

            <Typography
                sx={{
                    mt: 1,
                    opacity: 0.9,
                    fontSize: { xs: "0.85rem", md: "1rem" }
                }}
            >
                {today}
            </Typography>

            <Typography
                sx={{
                    mt: 2,
                    maxWidth: 700,
                    lineHeight: 1.7,
                    fontSize: { xs: "0.85rem", md: "1rem" },
                    display: { xs: "none", sm: "block" }
                }}
            >
                Welcome back to <strong>SchoolLink ERP</strong>.
                Manage students, teachers, attendance,
                fees, homework and school operations
                from one modern dashboard.
            </Typography>

        </Paper>

    );

}

export default HeroCard;
