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

        <Box sx={{ maxWidth: 700 }}>

            <Box
                onClick={() => navigate(-1)}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", cursor: "pointer", mb: 2, width: "fit-content" }}
            >

                <ArrowBackIcon fontSize="small" />

                <Typography sx={{ fontSize: "0.9rem" }}>Back</Typography>

            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>

                Expired Notifications

            </Typography>

            <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 3 }}>

                Notifications older than 30 days move here automatically and drop off your main bell menu.

            </Typography>

            <Card sx={{ p: 3 }}>

                {loading && (

                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>

                        <CircularProgress size={28} />

                    </Box>

                )}

                {!loading && notifications.length === 0 && (

                    <Box sx={{ textAlign: "center", py: 4 }}>

                        <NotificationsOffOutlinedIcon sx={{ fontSize: 40, color: "#CBD5E1", mb: 1 }} />

                        <Typography color="text.secondary">

                            No expired notifications yet.

                        </Typography>

                    </Box>

                )}

                {!loading && notifications.map((n) => (

                    <Box

                        key={n.id}

                        sx={{

                            py: 1.5,

                            borderBottom: "1px solid #F1F5F9",

                            "&:last-of-type": { borderBottom: "none" },

                            opacity: 0.75

                        }}

                    >

                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>

                            {n.title}

                        </Typography>

                        <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>

                            {n.message}

                        </Typography>

                        <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem", mt: 0.3 }}>

                            {timeAgo(n.created_at)}

                        </Typography>

                    </Box>

                ))}

            </Card>

        </Box>

    );

}

export default ExpiredNotificationsPage;
