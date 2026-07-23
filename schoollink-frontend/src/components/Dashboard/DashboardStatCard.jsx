import { Box, Typography } from "@mui/material";
import AppCard from "../ui/AppCard";

function DashboardStatCard({
    title,
    value,
    icon,
    color = "#2563EB"
}) {
    return (
        <AppCard
            sx={{
                position: "relative",
                overflow: "hidden",
                height: 170
            }}
        >
            <Box
                sx={{
                    position: "absolute",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: 6,
                    bgcolor: color,
                    borderRadius: "20px 0 0 20px"
                }}
            />

            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}
            >
                <Box>

                    <Typography
                        sx={{
                            color: "#64748B",
                            fontWeight: 600
                        }}
                    >
                        {title}
                    </Typography>

                    <Typography
                        sx={{
                            mt: 2,
                            fontWeight: 700,
                            fontSize: 48,
                            color: "#0F172A"
                        }}
                    >
                        {value}
                    </Typography>

                </Box>

                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: 4,
                        background: `${color}18`,
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        color: color
                    }}
                >
                    {icon}
                </Box>

            </Box>

        </AppCard>
    );
}

export default DashboardStatCard;