import { Box, Typography } from "@mui/material";

function DashboardHeader() {

    const user =
        JSON.parse(localStorage.getItem("user"));

    return (

        <Box sx={{ mb:4 }}>

            <Typography
                variant="h4"
                fontWeight={700}
            >
                Welcome back 👋
            </Typography>

            <Typography
                color="text.secondary"
                sx={{ mt:1 }}
            >
                {user?.full_name || "Administrator"}
            </Typography>

        </Box>

    );

}

export default DashboardHeader;