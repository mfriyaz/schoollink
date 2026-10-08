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
                boxShadow: "0 1px 3px rgba(15,23,42,.06)",
                border: "1px solid #EEF2F7",
                transition: ".2s",
                "&:hover": {
                    boxShadow: "0 4px 12px rgba(15,23,42,.08)"
                }
            }}
        >
            <CardActionArea
                onClick={onClick}
                sx={{
                    height: "100%",
                    px: 1.75,
                    py: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: 1.5
                }}
            >
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        minWidth: 36,
                        borderRadius: "10px",
                        bgcolor: color,
                        color: "white",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        "& svg": { fontSize: 20 }
                    }}
                >
                    {icon}
                </Box>

                <Typography
                    sx={{ fontWeight: 600, fontSize: "0.85rem", lineHeight: 1.25 }}
                >
                    {title}
                </Typography>
            </CardActionArea>
        </Card>
    );
}

export default QuickActionCard;
