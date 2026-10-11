import { Box, Typography } from "@mui/material";

import { Link, useLocation } from "react-router-dom";

import HomeIcon from "@mui/icons-material/HomeRounded";
import GroupsIcon from "@mui/icons-material/GroupsRounded";
import CampaignIcon from "@mui/icons-material/CampaignRounded";
import EventIcon from "@mui/icons-material/EventRounded";
import MoreIcon from "@mui/icons-material/GridViewRounded";
import AddIcon from "@mui/icons-material/AddCircleRounded";
import FactCheckIcon from "@mui/icons-material/FactCheckRounded";
import AssessmentIcon from "@mui/icons-material/AssessmentRounded";
import WeeklyIcon from "@mui/icons-material/EventNoteRounded";
import SettingsIcon from "@mui/icons-material/SettingsRounded";
import SchoolIcon from "@mui/icons-material/SchoolRounded";
import PaymentsIcon from "@mui/icons-material/PaymentsRounded";
import AddBusinessIcon from "@mui/icons-material/AddBusinessRounded";

import { getStoredUser } from "./Sidebar";

// The 4 most-used screens per role. Everything else is behind "More".
const tabs = {

    Admin: [
        { title: "Home", path: "/dashboard", icon: <HomeIcon /> },
        { title: "Students", path: "/students", icon: <GroupsIcon /> },
        { title: "Posts", path: "/posts", icon: <CampaignIcon /> },
        { title: "Calendar", path: "/school-calendar", icon: <EventIcon /> }
    ],

    Teacher: [
        { title: "Home", path: "/teacher/dashboard", icon: <HomeIcon /> },
        { title: "Post", path: "/teacher/create-post", icon: <AddIcon /> },
        { title: "Attendance", path: "/teacher/attendance", icon: <FactCheckIcon /> },
        { title: "Notices", path: "/teacher/announcements", icon: <CampaignIcon /> }
    ],

    Parent: [
        { title: "Home", path: "/parent/dashboard", icon: <HomeIcon /> },
        { title: "Results", path: "/parent/exam-results", icon: <AssessmentIcon /> },
        { title: "This Week", path: "/parent/this-week", icon: <WeeklyIcon /> },
        { title: "Settings", path: "/settings", icon: <SettingsIcon /> }
    ],

    "Super Admin": [
        { title: "Home", path: "/super-admin/dashboard", icon: <HomeIcon /> },
        { title: "Schools", path: "/super-admin/schools", icon: <SchoolIcon /> },
        { title: "Billing", path: "/super-admin/billing", icon: <PaymentsIcon /> },
        { title: "Onboard", path: "/super-admin/create-school", icon: <AddBusinessIcon /> }
    ]

};

const GRADIENT = "var(--sl-nav-active)";

/** Phone-only bottom navigation. "More" opens the full menu drawer. */
export default function BottomNav({ onMore }) {

    const location = useLocation();

    const role = getStoredUser()?.role;

    const items = tabs[role] || tabs.Admin;

    // Parents already see all of their screens, so no "More" button
    const showMore = role !== "Parent";

    const cells = [...items, ...(showMore ? [{ title: "More", icon: <MoreIcon />, more: true }] : [])];

    return (

        <Box
            component="nav"
            aria-label="Main navigation"
            sx={{
                position: "fixed",
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: (t) => t.zIndex.appBar,
                display: "flex",
                justifyContent: "space-around",
                px: 0.5,
                pt: 0.75,
                pb: "calc(8px + env(safe-area-inset-bottom))",
                bgcolor: "rgba(255,255,255,0.96)",
                backdropFilter: "blur(10px)",
                borderTop: "1px solid var(--sl-border)",
                borderRadius: "20px 20px 0 0",
                boxShadow: "0 -6px 24px rgba(15,23,42,0.1)"
            }}
        >

            {cells.map((c) => {

                const active = !c.more && location.pathname === c.path;

                const inner = (
                    <>
                        <Box
                            sx={{
                                width: 46,
                                height: 30,
                                borderRadius: "15px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background: active ? GRADIENT : "transparent",
                                color: active ? "var(--sl-on-nav-active)" : "#6B7194",
                                boxShadow: "none",
                                transition: "all .15s ease",
                                "& svg": { fontSize: 22 }
                            }}
                        >
                            {c.icon}
                        </Box>
                        <Typography sx={{ fontSize: "0.66rem", fontWeight: active ? 800 : 600, color: active ? "var(--sl-primary)" : "#6B7194", mt: 0.25, lineHeight: 1.1 }}>
                            {c.title}
                        </Typography>
                    </>
                );

                const sx = {
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textDecoration: "none",
                    background: "none",
                    border: 0,
                    cursor: "pointer",
                    py: 0.25,
                    font: "inherit",
                    WebkitTapHighlightColor: "transparent"
                };

                return c.more ? (
                    <Box key="more" component="button" type="button" onClick={onMore} sx={sx}>{inner}</Box>
                ) : (
                    <Box key={c.path} component={Link} to={c.path} sx={sx} aria-current={active ? "page" : undefined}>{inner}</Box>
                );

            })}

        </Box>

    );

}
