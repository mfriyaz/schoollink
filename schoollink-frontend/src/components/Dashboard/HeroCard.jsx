import {
    Box,
    Paper,
    Typography
} from "@mui/material";

import WavingHandIcon from "@mui/icons-material/WavingHand";

function HeroCard() {

    const storedUser = localStorage.getItem("user");

    const user = storedUser ? JSON.parse(storedUser) : null;

    const hour = new Date().getHours();

    let greeting = "Good Evening";

    if (hour < 12) {
        greeting = "Good Morning";
    } else if (hour < 17) {
        greeting = "Good Afternoon";
    }

    const today = new Date().toLocaleDateString("en-SG", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
    });

    return (

        <Paper
            elevation={0}
            sx={{
                px: { xs: 2.5, md: 3.5 },
                py: { xs: 2, md: 2.25 },
                mb: 3,
                borderRadius: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                color: "#FFFFFF",
                background: "linear-gradient(135deg,#2563EB,#4F46E5)",
                boxShadow: "0 8px 20px rgba(37,99,235,.2)"
            }}
        >

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>

                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        minWidth: 44,
                        borderRadius: "14px",
                        bgcolor: "rgba(255,255,255,0.16)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >

                    <WavingHandIcon sx={{ fontSize: 22 }} />

                </Box>

                <Box sx={{ minWidth: 0 }}>

                    <Typography
                        fontWeight={700}
                        sx={{
                            fontSize: { xs: "1.05rem", md: "1.25rem" },
                            lineHeight: 1.25,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                        }}
                    >
                        {greeting}{user ? `, ${user.full_name}` : ""}
                    </Typography>

                    <Typography
                        sx={{
                            opacity: 0.85,
                            fontSize: "0.78rem",
                            mt: 0.2
                        }}
                    >
                        {today}
                    </Typography>

                </Box>

            </Box>

            <Typography
                sx={{
                    opacity: 0.85,
                    fontSize: "0.8rem",
                    maxWidth: 280,
                    textAlign: "right",
                    display: { xs: "none", md: "block" }
                }}
            >
                Manage students, attendance, fees & more from one dashboard.
            </Typography>

        </Paper>

    );

}

export default HeroCard;
