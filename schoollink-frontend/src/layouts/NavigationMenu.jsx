import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import ClassIcon from "@mui/icons-material/Class";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import PaymentsIcon from "@mui/icons-material/Payments";
import QuizIcon from "@mui/icons-material/Quiz";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const NavigationMenu = [

    {
        title: "Dashboard",
        icon: <DashboardIcon />,
        path: "/dashboard"
    },

    {
        title: "Students",
        icon: <SchoolIcon />,
        path: "/students"
    },

    {
        title: "Teachers",
        icon: <PersonIcon />,
        path: "/teachers"
    },

    {
        title: "Classes",
        icon: <ClassIcon />,
        path: "/classes"
    },

    {
        title: "Attendance",
        icon: <EventAvailableIcon />,
        path: "/attendance"
    },

    {
        title: "Fees",
        icon: <PaymentsIcon />,
        path: "/fees"
    },

    {
        title: "Examinations",
        icon: <QuizIcon />,
        path: "/exams"
    },

    {
        title: "Reports",
        icon: <AssessmentIcon />,
        path: "/reports"
    },

    {
        title: "Settings",
        icon: <SettingsIcon />,
        path: "/settings"
    },

    {
        title: "Logout",
        icon: <LogoutIcon />,
        path: "/"
    }

];

export default NavigationMenu;