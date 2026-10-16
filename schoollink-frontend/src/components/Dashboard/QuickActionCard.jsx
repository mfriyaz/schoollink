import {
    Card,
    CardActionArea,
    Typography,
    Box
} from "@mui/material";
function QuickActionCard({
    title,
    icon,
    color,
    onClick
}) {
    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 3,
                boxShadow: "var(--sl-card-shadow)",
                border: "1px solid var(--sl-border)",
                transition: ".2s",
                "&:hover": {
                    transform: "translateY(-1px)"
                }
            }}
        >
            <CardActionArea
                onClick={onClick}
                sx={{
                    height: "100%",
                    px: { xs: 1.25, sm: 1.75 },
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: { xs: 1, sm: 1.5 }
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        minWidth: 36,
                        borderRadius: "12px",
                        bgcolor: `color-mix(in srgb, ${color} 18%, white)`,
                        border: "1.5px solid var(--sl-ink)",
                        color,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "& svg": { fontSize: 20 }
                    }}
                >
                    {icon}
                </Box>
                <Typography
                    sx={{ fontWeight: 700, color: "var(--sl-ink)", fontSize: { xs: "0.8rem", sm: "0.85rem" }, lineHeight: 1.25, minWidth: 0, overflowWrap: "anywhere" }}
                >
                    {title}
                </Typography>
            </CardActionArea>
        </Card>
    );
}
export default QuickActionCard;
