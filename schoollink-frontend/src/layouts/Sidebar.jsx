import {
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip,
    Drawer,
    useMediaQuery,
    useTheme
} from "@mui/material";

import { Link, useLocation, useNavigate } from "react-router-dom";

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
    "Exams": "Academics", "Grading Scale": "Academics", "Reports": "Academics",
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

function Sidebar({ collapsed, mobileOpen, onMobileClose }) {

    const muiTheme = useTheme();

    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

    const location = useLocation();

    const navigate = useNavigate();

    const storedRole = getStoredUser()?.role;

    const isAdminRole = !(storedRole === "Super Admin" || storedRole === "Teacher" || storedRole === "Parent");

    const menus = withGroups(getMenus(), isAdminRole);

    const storedUser = localStorage.getItem("user");

    const user = storedUser ? JSON.parse(storedUser) : null;

    const isSuperAdmin = user && user.role === "Super Admin";

    const theme = isSuperAdmin
        ? { bg: "linear-gradient(180deg,#2E1065 0%,#4C1D95 55%,#5B21B6 100%)", accent: "linear-gradient(135deg,#FF6B6B 0%,#C026D3 100%)", glow: "rgba(192,38,211,0.45)", accentSoft: "rgba(255,255,255,0.16)", brand: "SchoolLink Platform" }
        : { bg: "linear-gradient(180deg,#1E1B4B 0%,#312E81 60%,#3730A3 100%)", accent: "linear-gradient(135deg,#6366F1 0%,#8B5CF6 100%)", glow: "rgba(99,102,241,0.55)", accentSoft: "rgba(255,255,255,0.16)", brand: "SchoolLink" };

    const sidebarWidth = collapsed ? 76 : 260;

    return (

        <Drawer

            variant={isMobile ? "temporary" : "permanent"}

            open={isMobile ? mobileOpen : true}

            onClose={onMobileClose}

            slotProps={{

                root: { keepMounted: true },

                paper: {

                    sx: {

                        // MUI's Drawer paper defaults to position:
                        // fixed even in "permanent" mode - fine for
                        // the mobile overlay, but on desktop it means
                        // the sidebar floats on top of content instead
                        // of pushing it aside. Force normal in-flow
                        // positioning for desktop specifically.
                        position: isMobile ? "fixed" : "relative",

                        width: sidebarWidth,

                        flexShrink: 0,

                        background: theme.bg,

                        color: "white",

                        minHeight: isMobile ? 0 : "100vh",
                        height: isMobile ? "100dvh" : "auto",
                        maxHeight: isMobile ? "100dvh" : "none",

                        display: "flex",

                        flexDirection: "column",

                        transition: "width .2s ease",

                        overflow: "hidden",

                        border: "none"

                    }

                }

            }}

            onClick={() => {

                if (isMobile) {

                    onMobileClose?.();

                }

            }}

        >

            <Box

                sx={{

                    display: "flex",

                    alignItems: "center",

                    gap: 1.5,

                    p: 3,

                    justifyContent: collapsed ? "center" : "flex-start"

                }}

            >

                <Box

                    sx={{

                        width: 40, height: 40, borderRadius: "12px",

                        background: theme.accent,
                        boxShadow: `0 6px 14px ${theme.glow}`,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        flexShrink: 0

                    }}

                >

                    <MenuBookIcon sx={{ fontSize: 20 }} />

                </Box>

                {!collapsed && (

                    <Box>

                        <Typography

                            variant="h6"

                            sx={{

                                fontWeight: 700,

                                letterSpacing: 0.2,

                                whiteSpace: "nowrap",

                                lineHeight: 1.2

                            }}

                        >

                            {theme.brand}

                        </Typography>

                        {!isSuperAdmin && user && user.school && (

                            <Box

                                sx={{

                                    display: "inline-block",

                                    mt: 0.5,

                                    px: 1,

                                    py: 0.2,

                                    borderRadius: "6px",

                                    bgcolor: theme.accentSoft

                                }}

                            >

                                <Typography

                                    sx={{

                                        fontSize: "0.75rem",

                                        color: "#FFFFFF",

                                        fontWeight: 600,

                                        whiteSpace: "nowrap"

                                    }}

                                >

                                    {user.school}

                                </Typography>

                            </Box>

                        )}

                    </Box>

                )}

            </Box>

            <List sx={{ px: collapsed ? 1 : 2, mt: 1, flexGrow: 1, minHeight: 0, overflowY: "auto", overscrollBehavior: "contain", WebkitOverflowScrolling: "touch", pb: "calc(16px + env(safe-area-inset-bottom))" }}>

                {
                    menus.map((menu, idx) => {

                        const active = location.pathname === menu.path;

                        const tint = iconColors[menu.title] || "#C7D2FE";

                        const heading = menu.group && (idx === 0 || menus[idx - 1].group !== menu.group);

                        const button = (
                            <ListItemButton
                                component={Link}
                                to={menu.path}
                                selected={active}
                                sx={{
                                    color: active ? "white" : "#C7D2FE",
                                    borderRadius: "14px",
                                    mb: 0.5,
                                    py: 0.8,
                                    px: collapsed ? 0.5 : 1,
                                    justifyContent: collapsed ? "center" : "flex-start",
                                    transition: "all .15s ease",
                                    "&.Mui-selected": {
                                        background: theme.accent,
                                        boxShadow: `0 8px 18px ${theme.glow}`,
                                        color: "white"
                                    },
                                    "&.Mui-selected:hover": {
                                        background: theme.accent
                                    },
                                    "&:hover": {
                                        bgcolor: "rgba(255,255,255,0.09)"
                                    }
                                }}
                            >

                                <ListItemIcon
                                    sx={{
                                        minWidth: collapsed ? "auto" : 44,
                                        justifyContent: "center"
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 34,
                                            height: 34,
                                            borderRadius: "10px",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
                                            color: active ? "white" : tint,
                                            "& svg": { fontSize: 20 }
                                        }}
                                    >
                                        {menu.icon}
                                    </Box>
                                </ListItemIcon>

                                {!collapsed && (
                                    <ListItemText
                                        primary={menu.title}
                                        slotProps={{
                                            primary: {
                                                fontWeight: active ? 700 : 600,
                                                fontSize: "0.92rem"
                                            }
                                        }}
                                    />
                                )}

                            </ListItemButton>
                        );

                        const item = collapsed ? (
                            <Tooltip title={menu.title} placement="right">
                                {button}
                            </Tooltip>
                        ) : button;

                        return (
                            <Box key={menu.path}>
                                {heading && !collapsed && (
                                    <Typography sx={{ px: 1.5, pt: idx === 0 ? 0 : 1.5, pb: 0.75, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(199,210,254,0.55)" }}>
                                        {menu.group}
                                    </Typography>
                                )}
                                {item}
                            </Box>
                        );

                    })
                }

            </List>

            {user && !collapsed && (
                <Box sx={{ m: 2, mt: 0, p: 1.25, borderRadius: "14px", bgcolor: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", gap: 1.25 }}>
                    <Box sx={{ width: 36, height: 36, borderRadius: "50%", background: theme.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, flexShrink: 0 }}>
                        {String(user.name || user.username || "U").charAt(0).toUpperCase()}
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.2 }} noWrap>{user.name || user.username || "User"}</Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "rgba(199,210,254,0.8)" }} noWrap>{user.role}</Typography>
                    </Box>
                </Box>
            )}



        </Drawer>

    );

}

export default Sidebar;
