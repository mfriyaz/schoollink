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
        title: "Schools",
        path: "/super-admin/schools",
        icon: <GroupsIcon />
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

function Sidebar({ collapsed, mobileOpen, onMobileClose }) {

    const muiTheme = useTheme();

    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

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

                        bgcolor: theme.bg,

                        color: "white",

                        minHeight: "100vh",

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

            <List sx={{ px: collapsed ? 1 : 2, mt: 1, flexGrow: 1, overflowY: "auto" }}>

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

                                        slotProps={{

                                            primary: {

                                                fontWeight: active ? 600 : 500,

                                                fontSize: "0.92rem"

                                            }

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


        </Drawer>

    );

}

export default Sidebar;
