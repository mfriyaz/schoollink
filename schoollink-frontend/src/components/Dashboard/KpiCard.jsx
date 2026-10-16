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
                px: { xs: 1.25, sm: 1.25 },
                py: 1.5,
                height: "100%",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: { xs: 1, sm: 1.1 },
                borderRadius: 3,
                boxShadow: "var(--sl-card-shadow)",
                border: "1px solid var(--sl-border)",
                transition: ".2s",
                "&:hover": {
                    transform: "translateY(-1px)"
                }
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    minWidth: 40,
                    borderRadius: "12px",
                    bgcolor: iconBg || "var(--sl-accent)",
                    border: "1.5px solid var(--sl-ink)",
                                        display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    "& svg": { fontSize: 20 }
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.4rem", lineHeight: 1.1, color: "var(--sl-ink)", overflowWrap: "anywhere" }}>
                    {value}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.74rem", lineHeight: 1.25, mt: 0.25, overflowWrap: "break-word" }}>
                    {title}
                </Typography>
            </Box>
        </Card>
    );
}
export default KpiCard;
