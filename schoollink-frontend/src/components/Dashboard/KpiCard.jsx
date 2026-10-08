import { Card, Box, Typography } from "@mui/material";

function KpiCard({
    title,
    value,
    icon,
    iconBg
}) {
    return (
        <Card
            sx={{
                px: 1.75,
                py: 1.5,
                height: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 1.5,
                borderRadius: 3,
                boxShadow: "0 1px 3px rgba(15,23,42,.06)",
                border: "1px solid #EEF2F7",
                transition: ".2s",
                "&:hover": {
                    boxShadow: "0 4px 12px rgba(15,23,42,.08)"
                }
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    borderRadius: "10px",
                    bgcolor: iconBg || "#DBEAFE",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& svg": { fontSize: 20 }
                }}
            >
                {icon}
            </Box>

            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1.4rem", lineHeight: 1.1 }}>
                    {value}
                </Typography>
                <Typography sx={{ color: "#64748B", fontSize: "0.76rem", lineHeight: 1.25, mt: 0.25 }}>
                    {title}
                </Typography>
            </Box>
        </Card>
    );
}

export default KpiCard;
