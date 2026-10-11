import {
    Box,
    Typography,
    Tooltip,
    Drawer,
    IconButton,
    Collapse,
    useMediaQuery,
    useTheme
} from "@mui/material";

import { useEffect, useMemo, useState } from "react";

import { Link, useLocation } from "react-router-dom";

import ExpandMoreIcon from "@mui/icons-material/ExpandMoreRounded";
import CloseIcon from "@mui/icons-material/CloseRounded";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import AddCircleIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import HomeIcon from "@mui/icons-material/HomeOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";
import GradeIcon from "@mui/icons-material/GradeOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import ClassIcon from "@mui/icons-material/ClassOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DescriptionIcon from "@mui/icons-material/DescriptionOutlined";
import AddBusinessIcon from "@mui/icons-material/AddBusinessOutlined";
import ArchiveIcon from "@mui/icons-material/ArchiveOutlined";
import HistoryIcon from "@mui/icons-material/History";
import EventIcon from "@mui/icons-material/EventOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmberRounded";

const adminMenus = [

    {
        title: "Dashboard",
        path: "/dashboard",
        icon: <DashboardIcon />
    },

    {
        title: "Teachers",
        path: "/teachers",
        icon: <SchoolIcon />
    },

    {
        title: "Students",
        path: "/students",
        icon: <GroupsIcon />
    },

    {
        title: "Classes",
        path: "/classes",
        icon: <ClassIcon />
    },

    {
        title: "Subjects",
        path: "/subjects",
        icon: <MenuBookOutlinedIcon />
    },

    {
        title: "Posts",
        path: "/posts",
        icon: <MenuBookIcon />
    },

    {
        title: "Expired Announcements",
        path: "/announcements/expired",
        icon: <ArchiveIcon />
    },

    {
        title: "Create Announcement",
        path: "/create-announcement",
        icon: <CampaignIcon />
    },

    {
        title: "Exams",
        path: "/exams",
        icon: <AssessmentIcon />
    },

    {
        title: "Grading Scale",
        path: "/grades",
        icon: <GradeIcon />
    },

    {
        title: "Reports",
        path: "/reports",
        icon: <DescriptionIcon />
    },

    {
        title: "Early Warning",
        path: "/early-warning",
        icon: <WarningAmberIcon />
    },

    {
        title: "School Calendar",
        path: "/school-calendar",
        icon: <EventIcon />
    },

    {
        title: "Activity Log",
        path: "/activity-log",
        icon: <HistoryIcon />
    },

    {
        title: "Profile",
        path: "/profile",
        icon: <PersonIcon />
    },

    {
        title: "Settings",
        path: "/settings",
        icon: <SettingsIcon />
    }

];

const teacherMenus = [

    {
        title: "Dashboard",
        path: "/teacher/dashboard",
        icon: <DashboardIcon />
    },

    {
        title: "Create Post",
        path: "/teacher/create-post",
        icon: <AddCircleIcon />
    },

    {
        title: "Announcements",
        path: "/teacher/announcements",
        icon: <CampaignIcon />
    },

    {
        title: "Attendance",
        path: "/teacher/attendance",
        icon: <FactCheckIcon />
    },

    {
        title: "Enter Marks",
        path: "/teacher/enter-marks",
        icon: <GradeIcon />
    },

    {
        title: "Profile",
        path: "/profile",
        icon: <PersonIcon />
    },

    {
        title: "Settings",
        path: "/settings",
        icon: <SettingsIcon />
    }

];

const parentMenus = [

    {
        title: "Home",
        path: "/parent/dashboard",
        icon: <HomeIcon />
    },

    {
        title: "Exam Results",
        path: "/parent/exam-results",
        icon: <AssessmentIcon />
    },

    {
        title: "Profile",
        path: "/profile",
        icon: <PersonIcon />
    },

    {
        title: "Settings",
        path: "/settings",
        icon: <SettingsIcon />
    }

];

const superAdminMenus = [

    {
        title: "Dashboard",
        path: "/super-admin/dashboard",
        icon: <SpaceDashboardIcon />
    },


    {
        title: "Schools",
        path: "/super-admin/schools",
        icon: <GroupsIcon />
    },

    {
        title: "Billing",
        path: "/super-admin/billing",
        icon: <PaymentsIcon />
    },

    {
        title: "Onboard School",
        path: "/super-admin/create-school",
        icon: <AddBusinessIcon />
    },

    {
        title: "Profile",
        path: "/profile",
        icon: <PersonIcon />
    },

    {
        title: "Settings",
        path: "/settings",
        icon: <SettingsIcon />
    }

];

// Icon colour per menu item (bright enough for the dark sidebar).
// The active item stays white on the accent background.
const iconColors = {
    "Dashboard": "#818CF8",
    "Teachers": "#34D399",
    "Students": "#FBBF24",
    "Classes": "#A78BFA",
    "Subjects": "#2DD4BF",
    "Posts": "#38BDF8",
    "Expired Announcements": "#FB923C",
    "Create Announcement": "#F472B6",
    "Exams": "#FB7185",
    "Grading Scale": "#FACC15",
    "Reports": "#818CF8",
    "Early Warning": "#FB923C",
    "Activity Log": "#F59E0B",
    "School Calendar": "#C084FC",
    "Profile": "#22D3EE",
    "Settings": "#CBD5E1",
    "Create Post": "#4ADE80",
    "Announcements": "#F472B6",
    "Attendance": "#34D399",
    "Enter Marks": "#FACC15",
    "Home": "#818CF8",
    "Exam Results": "#FB7185",
    "Schools": "#A78BFA",
    "Onboard School": "#4ADE80"
};

// Groups the long admin menu under small headings (other roles are short, so no headings)
const adminGroups = {
    "Dashboard": "Overview",
    "Teachers": "People", "Students": "People", "Classes": "People", "Subjects": "People",
    "Posts": "Communication", "Create Announcement": "Communication", "Expired Announcements": "Communication", "School Calendar": "Communication",
    "Exams": "Academics", "Grading Scale": "Academics", "Reports": "Academics", "Early Warning": "Academics",
    "Activity Log": "Account", "Profile": "Account", "Settings": "Account"
};

const groupOrder = ["Overview", "People", "Communication", "Academics", "Account"];

function withGroups(menus, isAdmin) {

    if (!isAdmin) return menus.map((m) => ({ ...m, group: null }));

    return menus
        .map((m, i) => ({ ...m, group: adminGroups[m.title] || "Account", _i: i }))
        .sort((a, b) => groupOrder.indexOf(a.group) - groupOrder.indexOf(b.group) || a._i - b._i);

}

export function getMenus() {

    const storedUser = localStorage.getItem("user");

    const user = storedUser ? JSON.parse(storedUser) : null;

    if (user && user.role === "Super Admin") {

        return superAdminMenus;

    }

    if (user && user.role === "Teacher") {

        return teacherMenus;

    }

    if (user && user.role === "Parent") {

        return parentMenus;

    }

    return adminMenus;

}

export function getStoredUser() {

    try {

        return JSON.parse(localStorage.getItem("user"));

    } catch {

        return null;

    }

}

/** [{ name, items }] - a group with no name (or a single item) is shown flat */
function buildGroups(menus) {

    const groups = [];

    menus.forEach((m) => {

        const last = groups[groups.length - 1];

        if (last && last.name === m.group) {

            last.items.push(m);

        } else {

            groups.push({ name: m.group, items: [m] });

        }

    });

    return groups;

}

function isActive(pathname, path) {

    return pathname === path;

}

/* ------------------------------------------------------------------ */
/*  Phone: full menu as a bottom sheet with an app-style icon grid      */
/* ------------------------------------------------------------------ */

function MenuSheet({ open, onClose, groups, user, brand }) {

    const location = useLocation();

    return (

        <Drawer
            anchor="bottom"
            open={open}
            onClose={onClose}
            slotProps={{
                paper: {
                    sx: {
                        borderRadius: "26px 26px 0 0",
                        maxHeight: "86dvh",
                        bgcolor: "#FFFFFF",
                        color: "var(--sl-ink)",
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden"
                    }
                }
            }}
        >

            {/* Grab handle */}
            <Box sx={{ width: 44, height: 5, borderRadius: 3, bgcolor: "#D9DCE5", mx: "auto", mt: 1.25 }} />

            {/* Header */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2.5, pt: 1.5, pb: 1.25 }}>
                <Box sx={{ width: 42, height: 42, borderRadius: "50%", bgcolor: "var(--sl-nav-active)", color: "var(--sl-on-nav-active)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, flexShrink: 0 }}>
                    {String(user?.full_name || user?.name || user?.username || "U").charAt(0).toUpperCase()}
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.98rem", lineHeight: 1.2 }} noWrap>
                        {user?.full_name || user?.name || user?.username || brand}
                    </Typography>
                    <Typography sx={{ color: "#64748B", fontSize: "0.78rem" }} noWrap>
                        {[user?.role, user?.school].filter(Boolean).join(" - ") || brand}
                    </Typography>
                </Box>
                <IconButton onClick={onClose} aria-label="Close menu" sx={{ bgcolor: "var(--sl-soft)", color: "var(--sl-ink)" }}>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Scrollable grid */}
            <Box
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overscrollBehavior: "contain",
                    WebkitOverflowScrolling: "touch",
                    px: 2,
                    pt: 0.5,
                    pb: "calc(20px + env(safe-area-inset-bottom))"
                }}
            >

                {groups.map((g) => (

                    <Box key={g.name || "all"} sx={{ mb: 1.5 }}>

                        {g.name && g.items.length > 0 && groups.length > 1 && (
                            <Typography sx={{ px: 0.5, pt: 1, pb: 0.75, fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#94A3B8" }}>
                                {g.name}
                            </Typography>
                        )}

                        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1.25 }}>

                            {g.items.map((m) => {

                                const active = isActive(location.pathname, m.path);

                                const tint = m.title === "Settings" ? "#64748B" : (iconColors[m.title] || "#64748B");

                                return (

                                    <Box
                                        key={m.path}
                                        component={Link}
                                        to={m.path}
                                        onClick={onClose}
                                        aria-current={active ? "page" : undefined}
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "flex-start",
                                            gap: 0.75,
                                            textDecoration: "none",
                                            textAlign: "center",
                                            minHeight: 92,
                                            p: 1.25,
                                            borderRadius: "18px",
                                            border: "1.5px solid",
                                            borderColor: active ? "var(--sl-ink)" : "var(--sl-border)",
                                            bgcolor: active ? "var(--sl-nav-active)" : "var(--sl-page)",
                                            color: active ? "var(--sl-on-nav-active)" : "var(--sl-ink)",
                                            WebkitTapHighlightColor: "transparent",
                                            "&:active": { transform: "scale(0.97)" }
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 42,
                                                height: 42,
                                                borderRadius: "14px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                bgcolor: active ? "rgba(255,255,255,0.28)" : `color-mix(in srgb, ${tint} 16%, #fff)`,
                                                color: active ? "inherit" : tint,
                                                "& svg": { fontSize: 24 }
                                            }}
                                        >
                                            {m.icon}
                                        </Box>
                                        <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, lineHeight: 1.15, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {m.title}
                                        </Typography>
                                    </Box>

                                );

                            })}

                        </Box>

                    </Box>

                ))}

            </Box>

        </Drawer>

    );

}

/* ------------------------------------------------------------------ */
/*  Desktop / tablet: fixed sidebar, scrolls on its own, grouped        */
/* ------------------------------------------------------------------ */

function NavItem({ menu, active, collapsed, theme, indent }) {

    const tint = iconColors[menu.title] || "#C7D2FE";

    const row = (
        <Box
            component={Link}
            to={menu.path}
            aria-current={active ? "page" : undefined}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.25,
                textDecoration: "none",
                borderRadius: "14px",
                mb: 0.5,
                py: 0.6,
                pl: collapsed ? 0 : (indent ? 1.5 : 0.75),
                pr: collapsed ? 0 : 1,
                justifyContent: collapsed ? "center" : "flex-start",
                color: active ? theme.onActive : theme.text,
                background: active ? theme.accent : "transparent",
                transition: "background .15s ease",
                "&:hover": { bgcolor: active ? undefined : "rgba(255,255,255,0.09)" },
                "&:focus-visible": { outline: "2px solid var(--sl-accent)", outlineOffset: 1 }
            }}
        >
            <Box
                sx={{
                    width: 32,
                    height: 32,
                    flexShrink: 0,
                    borderRadius: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: active ? theme.tile : "rgba(255,255,255,0.08)",
                    color: active ? theme.onActive : tint,
                    "& svg": { fontSize: 19 }
                }}
            >
                {menu.icon}
            </Box>
            {!collapsed && (
                <Typography noWrap sx={{ fontSize: "0.9rem", fontWeight: active ? 700 : 600, color: "inherit", minWidth: 0 }}>
                    {menu.title}
                </Typography>
            )}
        </Box>
    );

    return collapsed ? <Tooltip title={menu.title} placement="right">{row}</Tooltip> : row;

}

function Sidebar({ collapsed, mobileOpen, onMobileClose }) {

    const muiTheme = useTheme();

    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

    const location = useLocation();

    const user = getStoredUser();

    const role = user?.role;

    const isSuperAdmin = role === "Super Admin";

    const isAdminRole = !(isSuperAdmin || role === "Teacher" || role === "Parent");

    const groups = useMemo(() => buildGroups(withGroups(getMenus(), isAdminRole)), [isAdminRole]);

    const activeGroup = groups.find((g) => g.items.some((m) => isActive(location.pathname, m.path)))?.name;

    // Start with the current page's group open (or the first real group)
    const [openGroups, setOpenGroups] = useState(() => {

        const real = (g) => g.name && g.items.length > 1;

        const current = groups.find((g) => g.name === activeGroup);

        const first = groups.find(real)?.name;

        return new Set([current && real(current) ? activeGroup : first].filter(Boolean));

    });

    // Opening a page opens its group
    useEffect(() => {

        if (activeGroup) setOpenGroups((s) => (s.has(activeGroup) ? s : new Set(s).add(activeGroup)));

    }, [activeGroup]);

    function toggle(name) {

        setOpenGroups((s) => {

            const n = new Set(s);

            if (n.has(name)) n.delete(name); else n.add(name);

            return n;

        });

    }

    const theme = {
        bg: "var(--sl-side-bg)", accent: "var(--sl-side-active)",
        onActive: "var(--sl-on-active)", text: "var(--sl-side-text)", muted: "var(--sl-side-muted)",
        tile: "color-mix(in srgb, var(--sl-on-active) 16%, transparent)",
        brand: isSuperAdmin ? "SchoolLink Platform" : "SchoolLink"
    };

    if (isMobile) {

        return <MenuSheet open={!!mobileOpen} onClose={onMobileClose} groups={groups} user={user} brand={theme.brand} />;

    }

    const sidebarWidth = collapsed ? 76 : 264;

    return (

        <Box
            component="aside"
            sx={{
                // Stays in place while the page scrolls; the menu scrolls inside it
                position: "sticky",
                top: 0,
                alignSelf: "flex-start",
                height: "100vh",
                width: sidebarWidth,
                flexShrink: 0,
                background: theme.bg,
                color: "white",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                transition: "width .2s ease"
            }}
        >

            {/* Brand */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: collapsed ? 2 : 2.5, pb: 1.5, justifyContent: collapsed ? "center" : "flex-start", flexShrink: 0 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "12px", background: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <MenuBookIcon sx={{ fontSize: 20, color: theme.onActive }} />
                </Box>
                {!collapsed && (
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" noWrap sx={{ fontWeight: 700, letterSpacing: 0.2, lineHeight: 1.2, color: "white" }}>
                            {theme.brand}
                        </Typography>
                        {!isSuperAdmin && user?.school && (
                            <Box sx={{ display: "inline-block", mt: 0.5, px: 1, py: 0.2, borderRadius: "6px", bgcolor: "rgba(255,255,255,0.16)", maxWidth: "100%" }}>
                                <Typography noWrap sx={{ fontSize: "0.75rem", color: "#FFFFFF", fontWeight: 600 }}>{user.school}</Typography>
                            </Box>
                        )}
                    </Box>
                )}
            </Box>

            {/* Menu - scrolls on its own */}
            <Box
                component="nav"
                aria-label="Main menu"
                sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: "auto",
                    overflowX: "hidden",
                    overscrollBehavior: "contain",
                    px: collapsed ? 1 : 1.75,
                    pt: 0.5,
                    pb: 1.5,
                    scrollbarWidth: "thin",
                    scrollbarColor: "rgba(255,255,255,0.28) transparent",
                    "&::-webkit-scrollbar": { width: 6 },
                    "&::-webkit-scrollbar-thumb": { background: "rgba(255,255,255,0.28)", borderRadius: 3 }
                }}
            >

                {groups.map((g) => {

                    // Single items, or the collapsed icon rail, are shown flat
                    const flat = collapsed || !g.name || g.items.length === 1;

                    if (flat) {

                        return g.items.map((m) => (
                            <NavItem key={m.path} menu={m} active={isActive(location.pathname, m.path)} collapsed={collapsed} theme={theme} />
                        ));

                    }

                    const open = openGroups.has(g.name);

                    const hasActive = g.name === activeGroup;

                    return (

                        <Box key={g.name} sx={{ mb: 0.5 }}>

                            <Box
                                component="button"
                                type="button"
                                onClick={() => toggle(g.name)}
                                aria-expanded={open}
                                sx={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background: "none",
                                    border: 0,
                                    cursor: "pointer",
                                    font: "inherit",
                                    px: 1,
                                    py: 0.9,
                                    mt: 0.5,
                                    borderRadius: "10px",
                                    color: hasActive ? "var(--sl-accent)" : theme.muted,
                                    "&:hover": { bgcolor: "rgba(255,255,255,0.06)" }
                                }}
                            >
                                <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "inherit" }}>
                                    {g.name}
                                </Typography>
                                <ExpandMoreIcon sx={{ fontSize: 20, transition: "transform .2s ease", transform: open ? "rotate(0deg)" : "rotate(-90deg)" }} />
                            </Box>

                            <Collapse in={open} timeout={180} unmountOnExit={false}>
                                <Box sx={{ pt: 0.25 }}>
                                    {g.items.map((m) => (
                                        <NavItem key={m.path} menu={m} active={isActive(location.pathname, m.path)} collapsed={false} theme={theme} />
                                    ))}
                                </Box>
                            </Collapse>

                        </Box>

                    );

                })}

            </Box>

            {/* Signed-in user */}
            {user && !collapsed && (
                <Box sx={{ m: 1.75, mt: 0.5, p: 1.25, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 1.25, flexShrink: 0 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: "50%", background: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0, color: theme.onActive }}>
                        {String(user.full_name || user.name || user.username || "U").charAt(0).toUpperCase()}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.2, color: "white" }} noWrap>{user.full_name || user.name || user.username || "User"}</Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: theme.muted }} noWrap>{user.role}</Typography>
                    </Box>
                </Box>
            )}

        </Box>

    );

}

export default Sidebar;
