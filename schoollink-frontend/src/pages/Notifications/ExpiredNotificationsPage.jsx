import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Card,
    CircularProgress,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import NotificationsOffOutlinedIcon from "@mui/icons-material/NotificationsOffOutlined";
import { getExpiredNotifications } from "../../services/notificationService";
function timeAgo(dateString) {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
function ExpiredNotificationsPage() {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        loadExpired();
    }, []);
    async function loadExpired() {
        try {
            setLoading(true);
            const response = await getExpiredNotifications();
            if (response.success) {
                setNotifications(response.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    return (
        <Box sx={{ maxWidth: 700, pb: 3 }}>
            <Box
                role="button"
                tabIndex={0}
                onClick={() => navigate(-1)}
                sx={{
                    display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.55, mb: 1.5,
                    borderRadius: 99, cursor: "pointer", fontSize: "0.82rem", fontWeight: 700,
                    color: "var(--sl-ink)", border: "1.5px solid var(--sl-ink)",
                    "&:hover": { bgcolor: "var(--sl-soft)" }
                }}
            >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
                Back
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <Box sx={{ width: 46, height: 46, minWidth: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <NotificationsOffOutlinedIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>
                        Expired Notifications
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        Older than 30 days, moved here automatically.
                    </Typography>
                </Box>
            </Box>
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={28} />
                </Box>
            )}
            {!loading && notifications.length === 0 && (
                <Box sx={{ textAlign: "center", py: 5, bgcolor: "#fff", border: "1.5px dashed var(--sl-ink)", borderRadius: 3 }}>
                    <NotificationsOffOutlinedIcon sx={{ fontSize: 40, color: "var(--sl-ink)", mb: 0.5 }} />
                    <Typography color="text.secondary">
                        No expired notifications yet.
                    </Typography>
                </Box>
            )}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {!loading && notifications.map((n) => (
                    <Card
                        key={n.id}
                        data-testid="expired-row"
                        sx={{
                            p: { xs: 1.5, md: 2 }, borderRadius: 3,
                            border: "1px solid var(--sl-border)", borderLeft: "6px solid var(--sl-soft2)",
                            boxShadow: "var(--sl-card-shadow)", opacity: 0.85
                        }}
                    >
                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: "0.92rem", color: "var(--sl-ink)" }}>
                                {n.title}
                            </Typography>
                            <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                                {timeAgo(n.created_at)}
                            </Typography>
                        </Box>
                        <Typography sx={{ color: "text.secondary", fontSize: "0.85rem", mt: 0.25 }}>
                            {n.message}
                        </Typography>
                    </Card>
                ))}
            </Box>
        </Box>
    );
}

export default ExpiredNotificationsPage;
