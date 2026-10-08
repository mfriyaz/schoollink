import { Card, Box, Typography } from "@mui/material";

function PanelCard({ title, subtitle, action, children, sx = {} }) {
    return (
        <Card
            sx={{
                height: "100%",
                borderRadius: 3,
                border: "1px solid #EEF2F7",
                boxShadow: "0 1px 3px rgba(15,23,42,.06)",
                p: { xs: 2, md: 2.5 },
                ...sx
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 1,
                    mb: 1.5
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.3 }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography sx={{ color: "#64748B", fontSize: "0.76rem", mt: 0.25 }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
                {action}
            </Box>

            {children}
        </Card>
    );
}

export function EmptyState({ icon, text }) {
    return (
        <Box
            sx={{
                py: 4,
                textAlign: "center",
                color: "#94A3B8",
                "& svg": { fontSize: 36, mb: 0.5 }
            }}
        >
            {icon}
            <Typography sx={{ fontSize: "0.85rem" }}>{text}</Typography>
        </Box>
    );
}

export default PanelCard;
