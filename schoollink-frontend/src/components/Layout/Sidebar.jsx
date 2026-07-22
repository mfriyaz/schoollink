import {
    Drawer,
    Toolbar,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText
} from "@mui/material";

import { NavLink } from "react-router-dom";

import DashboardIcon from "@mui/icons-material/Dashboard";
import SchoolIcon from "@mui/icons-material/School";
import PeopleIcon from "@mui/icons-material/People";
import ClassIcon from "@mui/icons-material/Class";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EventNoteIcon from "@mui/icons-material/EventNote";
import AssessmentIcon from "@mui/icons-material/Assessment";
import CampaignIcon from "@mui/icons-material/Campaign";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";

const drawerWidth = 240;

function Sidebar() {

    return (

        <Drawer
            variant="permanent"
            sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: drawerWidth,
                    boxSizing: "border-box"
                }
            }}
        >

            <Toolbar />

            <List>

                <MenuItem
                    icon={<DashboardIcon />}
                    text="Dashboard"
                    path="/dashboard"
                />

                <MenuItem
                    icon={<SchoolIcon />}
                    text="Students"
                    path="/students"
                />

                <MenuItem
                    icon={<PeopleIcon />}
                    text="Teachers"
                    path="/teachers"
                />

                <MenuItem
                    icon={<ClassIcon />}
                    text="Classes"
                    path="/classes"
                />

                <MenuItem
                    icon={<MenuBookIcon />}
                    text="Subjects"
                    path="/subjects"
                />

                <MenuItem
                    icon={<AssignmentIcon />}
                    text="Homework"
                    path="/homework"
                />

                <MenuItem
                    icon={<EventNoteIcon />}
                    text="Exams"
                    path="/exams"
                />

                <MenuItem
                    icon={<AssessmentIcon />}
                    text="Report Cards"
                    path="/report-cards"
                />

                <MenuItem
                    icon={<CampaignIcon />}
                    text="Announcements"
                    path="/announcements"
                />

                <MenuItem
                    icon={<SettingsIcon />}
                    text="Settings"
                    path="/settings"
                />

                <MenuItem
                    icon={<LogoutIcon />}
                    text="Logout"
                    path="/"
                />

            </List>

        </Drawer>

    );

}

function MenuItem({ icon, text, path }) {

    return (

        <ListItemButton
            component={NavLink}
            to={path}
            sx={{
                "&.active": {
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                        color: "#fff"
                    }
                }
            }}
        >

            <ListItemIcon>

                {icon}

            </ListItemIcon>

            <ListItemText primary={text} />

        </ListItemButton>

    );

}

export default Sidebar;