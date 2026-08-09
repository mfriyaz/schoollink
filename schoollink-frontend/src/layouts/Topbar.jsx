import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {

    AppBar,

    Toolbar,

    Typography,

    Box,

    Avatar,

    IconButton,

    Badge,

    Menu,

    MenuItem,

    Divider,

    CircularProgress,

    Tooltip

} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

import {
    getMyNotifications,
    getUnreadCount,
    markAsRead,
    markAllAsRead
} from "../services/notificationService";

function getUser() {

    const storedUser = localStorage.getItem("user");

    return storedUser ? JSON.parse(storedUser) : null;

}

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

function Topbar({ onToggleSidebar }) {

    const navigate = useNavigate();

    const user = getUser();

    const [anchorEl, setAnchorEl] = useState(null);

    const [unreadCount, setUnreadCount] = useState(0);

    const [notifications, setNotifications] = useState([]);

    const [loadingList, setLoadingList] = useState(false);

    useEffect(() => {

        loadUnreadCount();

        // Refresh the unread badge periodically so it doesn't
        // go stale during a long session.
        const interval = setInterval(loadUnreadCount, 30000);

        return () => clearInterval(interval);

    }, []);

    async function loadUnreadCount() {

        try {

            const response = await getUnreadCount();

            if (response.success) {

                setUnreadCount(response.data.count);

            }

        } catch (err) {

            console.error(err);

        }

    }

    async function handleOpenMenu(event) {

        setAnchorEl(event.currentTarget);

        setLoadingList(true);

        try {

            const response = await getMyNotifications();

            if (response.success) {

                setNotifications(response.data);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoadingList(false);

        }

    }

    function handleCloseMenu() {

        setAnchorEl(null);

    }

    async function handleNotificationClick(notification) {

        handleCloseMenu();

        if (!notification.is_read) {

            try {

                await markAsRead(notification.id);

                setUnreadCount((c) => Math.max(0, c - 1));

            } catch (err) {

                console.error(err);

            }

        }

        if (notification.link) {

            navigate(notification.link);

        }

    }

    async function handleMarkAllAsRead() {

        try {

            await markAllAsRead();

            setUnreadCount(0);

            setNotifications((list) =>
                list.map((n) => ({ ...n, is_read: true }))
            );

        } catch (err) {

            console.error(err);

        }

    }

    return (

        <AppBar

            position="static"

            elevation={0}

            color="inherit"

            sx={{

                borderBottom: "1px solid #E5E7EB"

            }}

        >

            <Toolbar sx={{ py: 1 }}>

                <Tooltip title="Toggle sidebar (Ctrl + Shift + ,)">

                    <IconButton sx={{ color: "#64748B" }} onClick={onToggleSidebar}>

                        <MenuIcon />

                    </IconButton>

                </Tooltip>

                <Box sx={{ flexGrow: 1 }} />

                <IconButton onClick={handleOpenMenu}>

                    <Badge

                        badgeContent={unreadCount}

                        color="error"

                        overlap="circular"

                    >

                        <NotificationsNoneIcon sx={{ color: "#64748B" }} />

                    </Badge>

                </IconButton>

                <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    PaperProps={{ sx: { width: 360, maxHeight: 420 } }}
                >

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 2, py: 1 }}>

                        <Typography sx={{ fontWeight: 700 }}>

                            Notifications

                        </Typography>

                        {unreadCount > 0 && (

                            <Typography

                                onClick={handleMarkAllAsRead}

                                sx={{ color: "#2563EB", fontSize: "0.8rem", cursor: "pointer" }}

                            >

                                Mark all as read

                            </Typography>

                        )}

                    </Box>

                    <Divider />

                    {loadingList && (

                        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>

                            <CircularProgress size={24} />

                        </Box>

                    )}

                    {!loadingList && notifications.length === 0 && (

                        <Box sx={{ px: 2, py: 3 }}>

                            <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>

                                No notifications yet.

                            </Typography>

                        </Box>

                    )}

                    {!loadingList && notifications.map((n) => (

                        <MenuItem
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            sx={{

                                whiteSpace: "normal",

                                alignItems: "flex-start",

                                bgcolor: n.is_read ? "transparent" : "#EFF6FF",

                                py: 1.2

                            }}
                        >

                            <Box>

                                <Typography sx={{ fontWeight: 600, fontSize: "0.88rem" }}>

                                    {n.title}

                                </Typography>

                                <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>

                                    {n.message}

                                </Typography>

                                <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem", mt: 0.3 }}>

                                    {timeAgo(n.created_at)}

                                </Typography>

                            </Box>

                        </MenuItem>

                    ))}

                </Menu>

                <Box

                    sx={{

                        display: "flex",

                        alignItems: "center",

                        gap: 1.5,

                        ml: 2

                    }}

                >

                    <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>

                        <Typography

                            sx={{

                                fontWeight: 600,

                                fontSize: "0.88rem",

                                lineHeight: 1.2

                            }}

                        >

                            {user ? user.full_name : "Guest"}

                        </Typography>

                        <Typography

                            sx={{

                                fontSize: "0.75rem",

                                color: user && user.role === "Super Admin" ? "#7C3AED" : "#64748B",

                                fontWeight: user && user.role === "Super Admin" ? 700 : 400

                            }}

                        >

                            {user && user.role === "Super Admin" ? "Platform Admin" : (user ? user.role : "")}

                        </Typography>

                    </Box>

                    <Avatar sx={{ bgcolor: user && user.role === "Super Admin" ? "#7C3AED" : "#2563EB" }}>

                        {user && user.full_name ? user.full_name[0] : "?"}

                    </Avatar>

                </Box>

            </Toolbar>

        </AppBar>

    );

}

export default Topbar;
