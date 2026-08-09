import {
    Box,
    Typography,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip
} from "@mui/material";

import { Link, useLocation, useNavigate } from "react-router-dom";

import MenuBookIcon from "@mui/icons-material/MenuBook";
import DashboardIcon from "@mui/icons-material/SpaceDashboardOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import AddCircleIcon from "@mui/icons-material/AddCircleOutlineOutlined";
import HomeIcon from "@mui/icons-material/HomeOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import LogoutIcon from "@mui/icons-material/LogoutOutlined";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";
import AssessmentIcon from "@mui/icons-material/AssessmentOutlined";
import GradeIcon from "@mui/icons-material/GradeOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import ClassIcon from "@mui/icons-material/ClassOutlined";

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
        title: "Posts",
        path: "/posts",
        icon: <MenuBookIcon />
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
        title: "Schools",
        path: "/super-admin/schools",
        icon: <GroupsIcon />
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

function getMenus() {

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

function Sidebar({ collapsed }) {

    const location = useLocation();

    const navigate = useNavigate();

    const menus = getMenus();

    const storedUser = localStorage.getItem("user");

    const user = storedUser ? JSON.parse(storedUser) : null;

    const isSuperAdmin = user && user.role === "Super Admin";

    const theme = isSuperAdmin
        ? { bg: "#1E1B3A", accent: "#7C3AED", accentSoft: "rgba(124,58,237,0.15)", brand: "SchoolLink Platform" }
        : { bg: "#0F172A", accent: "#2563EB", accentSoft: "rgba(37,99,235,0.15)", brand: "SchoolLink" };

    const sidebarWidth = collapsed ? 76 : 260;

    function handleLogout() {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/login");

    }

    return (

        <Box

            sx={{

                width: sidebarWidth,

                flexShrink: 0,

                bgcolor: theme.bg,

                color: "white",

                minHeight: "100vh",

                display: "flex",

                flexDirection: "column",

                transition: "width .2s ease",

                overflow: "hidden"

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

                        width: 36,

                        height: 36,

                        borderRadius: "10px",

                        bgcolor: theme.accent,

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center",

                        flexShrink: 0

                    }}

                >

                    <MenuBookIcon sx={{ fontSize: 20 }} />

                </Box>

                {!collapsed && (

                    <Typography

                        variant="h6"

                        sx={{

                            fontWeight: 700,

                            letterSpacing: 0.2,

                            whiteSpace: "nowrap"

                        }}

                    >

                        {theme.brand}

                    </Typography>

                )}

            </Box>

            <List sx={{ px: collapsed ? 1 : 2, mt: 1, flexGrow: 1 }}>

                {

                    menus.map((menu) => {

                        const active = location.pathname === menu.path;

                        const button = (

                            <ListItemButton

                                key={menu.path}

                                component={Link}

                                to={menu.path}

                                selected={active}

                                sx={{

                                    color: active ? "white" : "#94A3B8",

                                    borderRadius: 2,

                                    mb: 0.5,

                                    py: 1.1,

                                    justifyContent: collapsed ? "center" : "flex-start",

                                    "&.Mui-selected": {

                                        bgcolor: theme.accent,

                                        color: "white"

                                    },

                                    "&.Mui-selected:hover": {

                                        bgcolor: theme.accent

                                    },

                                    "&:hover": {

                                        bgcolor: "rgba(255,255,255,0.06)"

                                    }

                                }}

                            >

                                <ListItemIcon

                                    sx={{

                                        color: "inherit",

                                        minWidth: collapsed ? "auto" : 36,

                                        justifyContent: "center"

                                    }}

                                >

                                    {menu.icon}

                                </ListItemIcon>

                                {!collapsed && (

                                    <ListItemText

                                        primary={menu.title}

                                        primaryTypographyProps={{

                                            fontWeight: active ? 600 : 500,

                                            fontSize: "0.92rem"

                                        }}

                                    />

                                )}

                            </ListItemButton>

                        );

                        return collapsed ? (

                            <Tooltip key={menu.path} title={menu.title} placement="right">

                                {button}

                            </Tooltip>

                        ) : button;

                    })

                }

            </List>

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 2 }} />

            <Box sx={{ px: collapsed ? 1 : 2, py: 2 }}>

                {(() => {

                    const logoutButton = (

                        <ListItemButton

                            onClick={handleLogout}

                            sx={{

                                color: "#94A3B8",

                                borderRadius: 2,

                                py: 1.1,

                                justifyContent: collapsed ? "center" : "flex-start",

                                "&:hover": {

                                    bgcolor: "rgba(255,255,255,0.06)",

                                    color: "white"

                                }

                            }}

                        >

                            <ListItemIcon

                                sx={{

                                    color: "inherit",

                                    minWidth: collapsed ? "auto" : 36,

                                    justifyContent: "center"

                                }}

                            >

                                <LogoutIcon />

                            </ListItemIcon>

                            {!collapsed && (

                                <ListItemText

                                    primary="Logout"

                                    primaryTypographyProps={{

                                        fontWeight: 500,

                                        fontSize: "0.92rem"

                                    }}

                                />

                            )}

                        </ListItemButton>

                    );

                    return collapsed ? (

                        <Tooltip title="Logout" placement="right">

                            {logoutButton}

                        </Tooltip>

                    ) : logoutButton;

                })()}

            </Box>

        </Box>

    );

}

export default Sidebar;
