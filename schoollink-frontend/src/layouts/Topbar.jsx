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
    Drawer,

    MenuItem,

    Divider,

    CircularProgress,

    Tooltip

} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import CloseIcon from "@mui/icons-material/Close";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import EmojiEmotionsOutlinedIcon from "@mui/icons-material/EmojiEmotionsOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import RateReviewOutlinedIcon from "@mui/icons-material/RateReviewOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlineOutlined";

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

// The notifications table has no "type" column, so pick an icon and
// colour from the wording / link of each notification.
function notificationStyle(n) {

    const text = `${n.title || ""} ${n.message || ""} ${n.link || ""}`.toLowerCase();

    if (text.includes("announcement")) {
        return { icon: <CampaignOutlinedIcon />, color: "#DB2777", bg: "#FCE7F3" };
    }

    if (text.includes("good morning") || text.includes("greeting") || text.includes("react")) {
        return { icon: <EmojiEmotionsOutlinedIcon />, color: "#D97706", bg: "#FEF3C7" };
    }

    if (text.includes("acknowledg")) {
        return { icon: <TaskAltOutlinedIcon />, color: "#16A34A", bg: "#DCFCE7" };
    }

    if (text.includes("review") || text.includes("submission") || text.includes("marks") || text.includes("exam")) {
        return { icon: <RateReviewOutlinedIcon />, color: "#7C3AED", bg: "#EDE9FE" };
    }

    if (text.includes("homework") || text.includes("post")) {
        return { icon: <MenuBookOutlinedIcon />, color: "#2563EB", bg: "#DBEAFE" };
    }

    return { icon: <NotificationsActiveOutlinedIcon />, color: "#475569", bg: "#F1F5F9" };
}

function Topbar({ onToggleSidebar }) {

    const navigate = useNavigate();

    const user = getUser();

    const [anchorEl, setAnchorEl] = useState(null);

    const [avatarAnchorEl, setAvatarAnchorEl] = useState(null);

    const [unreadCount, setUnreadCount] = useState(0);

    const [notifications, setNotifications] = useState([]);

    const [loadingList, setLoadingList] = useState(false);
    const [notifTab, setNotifTab] = useState("all");

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

    function handleOpenAvatarMenu(event) {

        setAvatarAnchorEl(event.currentTarget);

    }

    function handleCloseAvatarMenu() {

        setAvatarAnchorEl(null);

    }

    function handleLogout() {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/login");

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

    const visibleNotifications = notifTab === "unread"
        ? notifications.filter((n) => !n.is_read)
        : notifications;

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

                <IconButton
                    onClick={handleOpenMenu}
                    sx={{
                        bgcolor: unreadCount > 0 ? "#EFF6FF" : "#F1F5F9",
                        "&:hover": { bgcolor: "#E2E8F0" }
                    }}
                >
                    <Badge
                        badgeContent={unreadCount}
                        max={9}
                        color="error"
                        overlap="circular"
                    >
                        {unreadCount > 0
                            ? <NotificationsActiveOutlinedIcon sx={{ color: "#2563EB" }} />
                            : <NotificationsNoneIcon sx={{ color: "#64748B" }} />}
                    </Badge>
                </IconButton>

                <Drawer
                    anchor="right"
                    open={Boolean(anchorEl)}
                    onClose={handleCloseMenu}
                    slotProps={{
                        paper: {
                            sx: {
                                width: { xs: "100%", sm: 400 },
                                maxWidth: "100%",
                                bgcolor: "#F8FAFC",
                                borderTopLeftRadius: { xs: 0, sm: 20 },
                                borderBottomLeftRadius: { xs: 0, sm: 20 }
                            }
                        }
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            px: 2.5,
                            pt: 2.5,
                            pb: 1.5,
                            bgcolor: "#FFFFFF",
                            borderBottom: "1px solid #EEF2F7"
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Typography sx={{ fontWeight: 700, fontSize: "1.2rem" }}>
                                    Notifications
                                </Typography>
                                {unreadCount > 0 && (
                                    <Box
                                        sx={{
                                            px: 1,
                                            py: 0.1,
                                            borderRadius: 5,
                                            bgcolor: "#2563EB",
                                            color: "white",
                                            fontSize: "0.74rem",
                                            fontWeight: 700
                                        }}
                                    >
                                        {unreadCount} new
                                    </Box>
                                )}
                            </Box>

                            <IconButton size="small" onClick={handleCloseMenu}>
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: 1.5 }}>
                            <Box sx={{ display: "flex", gap: 0.75 }}>
                                {[
                                    { value: "all", label: "All" },
                                    { value: "unread", label: "Unread" }
                                ].map((t) => (
                                    <Box
                                        key={t.value}
                                        onClick={() => setNotifTab(t.value)}
                                        sx={{
                                            px: 1.5,
                                            py: 0.5,
                                            borderRadius: 5,
                                            cursor: "pointer",
                                            fontSize: "0.8rem",
                                            fontWeight: 600,
                                            bgcolor: notifTab === t.value ? "#2563EB" : "#F1F5F9",
                                            color: notifTab === t.value ? "#FFFFFF" : "#475569"
                                        }}
                                    >
                                        {t.label}
                                    </Box>
                                ))}
                            </Box>

                            {unreadCount > 0 && (
                                <Box
                                    onClick={handleMarkAllAsRead}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 0.5,
                                        color: "#2563EB",
                                        fontSize: "0.8rem",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        "&:hover": { textDecoration: "underline" }
                                    }}
                                >
                                    <DoneAllIcon sx={{ fontSize: 16 }} />
                                    Mark all read
                                </Box>
                            )}
                        </Box>
                    </Box>

                    {/* List */}
                    <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>

                        {loadingList && (
                            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                                <CircularProgress size={26} />
                            </Box>
                        )}

                        {!loadingList && visibleNotifications.length === 0 && (
                            <Box sx={{ textAlign: "center", py: 8, color: "#94A3B8" }}>
                                <NotificationsNoneIcon sx={{ fontSize: 48, mb: 1 }} />
                                <Typography sx={{ fontWeight: 600, color: "#64748B" }}>
                                    {notifTab === "unread" ? "You're all caught up" : "No notifications yet"}
                                </Typography>
                                <Typography sx={{ fontSize: "0.82rem", mt: 0.5 }}>
                                    New updates from school will show up here.
                                </Typography>
                            </Box>
                        )}

                        {!loadingList && visibleNotifications.map((n) => {
                            const st = notificationStyle(n);

                            return (
                                <Box
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    sx={{
                                        display: "flex",
                                        gap: 1.5,
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: 3,
                                        cursor: "pointer",
                                        bgcolor: "#FFFFFF",
                                        border: "1px solid",
                                        borderColor: n.is_read ? "#EEF2F7" : "#BFDBFE",
                                        boxShadow: n.is_read ? "none" : "0 2px 8px rgba(37,99,235,.08)",
                                        transition: ".15s",
                                        "&:hover": { boxShadow: "0 4px 12px rgba(15,23,42,.08)" }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            minWidth: 40,
                                            borderRadius: "12px",
                                            bgcolor: st.bg,
                                            color: st.color,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            "& svg": { fontSize: 21 }
                                        }}
                                    >
                                        {st.icon}
                                    </Box>

                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography
                                            sx={{
                                                fontWeight: n.is_read ? 600 : 700,
                                                fontSize: "0.88rem",
                                                lineHeight: 1.3
                                            }}
                                        >
                                            {n.title}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                color: "#64748B",
                                                fontSize: "0.8rem",
                                                mt: 0.25,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden"
                                            }}
                                        >
                                            {n.message}
                                        </Typography>

                                        <Typography sx={{ color: "#94A3B8", fontSize: "0.72rem", mt: 0.5 }}>
                                            {timeAgo(n.created_at)}
                                        </Typography>
                                    </Box>

                                    {!n.is_read && (
                                        <Box
                                            sx={{
                                                width: 9,
                                                height: 9,
                                                minWidth: 9,
                                                mt: 0.75,
                                                borderRadius: "50%",
                                                bgcolor: "#2563EB"
                                            }}
                                        />
                                    )}
                                </Box>
                            );
                        })}
                    </Box>

                    {/* Footer */}
                    <Box
                        onClick={() => {
                            handleCloseMenu();
                            navigate("/notifications/expired");
                        }}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.75,
                            py: 1.75,
                            bgcolor: "#FFFFFF",
                            borderTop: "1px solid #EEF2F7",
                            color: "#2563EB",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            "&:hover": { bgcolor: "#F8FAFC" }
                        }}
                    >
                        <ArchiveOutlinedIcon sx={{ fontSize: 18 }} />
                        View expired notifications
                    </Box>
                </Drawer>

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

                    <Avatar

                        onClick={handleOpenAvatarMenu}

                        sx={{ bgcolor: user && user.role === "Super Admin" ? "#7C3AED" : "#2563EB", cursor: "pointer" }}
                    >

                        {user && user.full_name ? user.full_name[0] : "?"}

                    </Avatar>

                    <Menu

                        anchorEl={avatarAnchorEl}

                        open={Boolean(avatarAnchorEl)}

                        onClose={handleCloseAvatarMenu}

                        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}

                        transformOrigin={{ vertical: "top", horizontal: "right" }}
                    >

                        <MenuItem

                            onClick={() => {

                                handleCloseAvatarMenu();

                                navigate("/profile");

                            }}
                        >

                            <PersonIcon fontSize="small" sx={{ mr: 1.5, color: "#64748B" }} />

                            Profile

                        </MenuItem>

                        <Divider />

                        <MenuItem onClick={handleLogout}>

                            <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: "#DC2626" }} />

                            <Typography sx={{ color: "#DC2626" }}>Logout</Typography>

                        </MenuItem>

                    </Menu>

                </Box>

            </Toolbar>

        </AppBar>

    );

}

export default Topbar;
