import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Box, Grid, Tabs, Tab } from "@mui/material";

import HeroCard from "../../components/Dashboard/HeroCard";
import SectionTitle from "../../components/common/SectionTitle";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PaymentsIcon from "@mui/icons-material/Payments";

import KpiCard from "../../components/Dashboard/KpiCard";
import QuickActionCard from "../../components/Dashboard/QuickActionCard";

import DashboardCharts from "../../components/Dashboard/DashboardCharts";

import CalendarCard from "../../components/Dashboard/CalendarCard";
import AnnouncementCard from "../../components/Dashboard/AnnouncementCard";

import DashboardSection from "../../components/Dashboard/DashboardSection";
import RecentStudentCard from "../../components/Dashboard/RecentStudentCard";
import BirthdayCard from "../../components/Dashboard/BirthdayCard";

import RecentPostsCard from "../../components/Dashboard/RecentPostsCard";
import PendingAcknowledgementsChart from "../../components/Dashboard/PendingAcknowledgementsChart";

import EventNoteIcon from "@mui/icons-material/EventNote";
import PendingActionsIcon from "@mui/icons-material/PendingActions";
import CampaignIcon from "@mui/icons-material/Campaign";

import { getDashboardSummary } from "../../services/dashboardService";

function DashboardPage() {

    const navigate = useNavigate();

    const [dashboard, setDashboard] = useState(null);

    const [tab, setTab] = useState(0);

    useEffect(() => {

        loadDashboard();

    }, []);

    async function loadDashboard() {

        try {

            const response = await getDashboardSummary();

            if (response.success) {

                setDashboard(response.data);

            }

        } catch (error) {

            console.error(error);

        }

    }

    if (!dashboard) {

        return null;

    }

    return (

        <Box>

            <HeroCard />

            <Tabs

                value={tab}

                onChange={(e, value) => setTab(value)}

                sx={{

                    mb: 3,

                    borderBottom: "1px solid #E2E8F0",

                    "& .MuiTab-root": {

                        textTransform: "none",

                        fontWeight: 600,

                        fontSize: "0.95rem"

                    }

                }}

            >

                <Tab label="Overview" />

                <Tab label="Posts & Acknowledgements" />

                <Tab label="Students" />

            </Tabs>

            {tab === 0 && (

                <Box>

                    <SectionTitle>

                        Dashboard Overview

                    </SectionTitle>

                    <Grid
                        container
                        spacing={3}
                        sx={{ mb: 4 }}
                    >

                        <Grid item xs={12} sm={6} lg={3}>

                            <KpiCard
                                title="Students"
                                value={dashboard.students}
                                icon={<PeopleAltIcon sx={{ color: "#16A34A" }} />}
                                iconBg="#DCFCE7"
                            />

                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>

                            <KpiCard
                                title="Teachers"
                                value={dashboard.teachers}
                                icon={<SchoolIcon sx={{ color: "#2563EB" }} />}
                                iconBg="#DBEAFE"
                            />

                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>

                            <KpiCard
                                title="Classes"
                                value={dashboard.classes}
                                icon={<MenuBookIcon sx={{ color: "#D97706" }} />}
                                iconBg="#FEF3C7"
                            />

                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>

                            <KpiCard
                                title="Attendance"
                                value={`${dashboard.attendance}%`}
                                icon={<TaskAltIcon sx={{ color: "#7C3AED" }} />}
                                iconBg="#EDE9FE"
                            />

                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>

                            <KpiCard
                                title="Posts Today"
                                value={dashboard.postsToday}
                                icon={<EventNoteIcon sx={{ color: "#2563EB" }} />}
                                iconBg="#DBEAFE"
                            />

                        </Grid>

                        <Grid item xs={12} sm={6} lg={3}>

                            <KpiCard
                                title="Pending Acknowledgements"
                                value={dashboard.pendingAcknowledgements}
                                icon={<PendingActionsIcon sx={{ color: "#EA580C" }} />}
                                iconBg="#FFEDD5"
                            />

                        </Grid>

                    </Grid>

                    <SectionTitle>

                        Quick Actions

                    </SectionTitle>

                    <Grid
                        container
                        spacing={3}
                    >

                        <Grid item xs={6} md={3}>

                            <QuickActionCard
                                title="Add Student"
                                icon={<PersonAddIcon />}
                                color="#2563EB"
                            />

                        </Grid>

                        <Grid item xs={6} md={3}>

                            <QuickActionCard
                                title="Add Teacher"
                                icon={<SchoolIcon />}
                                color="#16A34A"
                            />

                        </Grid>

                        <Grid item xs={6} md={3}>

                            <QuickActionCard
                                title="Attendance"
                                icon={<AssignmentTurnedInIcon />}
                                color="#EA580C"
                            />

                        </Grid>

                        <Grid item xs={6} md={3}>

                            <QuickActionCard
                                title="Collect Fees"
                                icon={<PaymentsIcon />}
                                color="#7C3AED"
                            />

                        </Grid>

                        <Grid item xs={6} md={3}>

                            <QuickActionCard
                                title="Create Announcement"
                                icon={<CampaignIcon />}
                                color="#DB2777"
                                onClick={() => navigate("/create-announcement")}
                            />

                        </Grid>

                    </Grid>

                </Box>

            )}

            {tab === 1 && (

                <Box>

                    <DashboardCharts />

                    <DashboardSection

                        left={

                            <RecentPostsCard
                                posts={dashboard.recentPosts || []}
                            />

                        }

                        right={

                            <PendingAcknowledgementsChart
                                pendingByClass={dashboard.pendingByClass || []}
                            />

                        }

                    />

                </Box>

            )}

            {tab === 2 && (

                <Box>

                    <Grid
                        container
                        spacing={3}
                        sx={{ mb: 4 }}
                    >

                        <Grid item xs={12} md={6}>

                            <CalendarCard />

                        </Grid>

                        <Grid item xs={12} md={6}>

                            <AnnouncementCard
                                announcements={dashboard.announcements || []}
                            />

                        </Grid>

                    </Grid>

                    <DashboardSection

                        left={

                            <RecentStudentCard
                                students={dashboard.recentStudents || []}
                            />

                        }

                        right={

                            <BirthdayCard
                                birthdays={dashboard.birthdays || []}
                            />

                        }

                    />

                </Box>

            )}

        </Box>

    );

}

export default DashboardPage;
