import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Grid } from "@mui/material";
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
    const tabs = ["Overview", "Posts & Acknowledgements", "Students"];
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
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
                {tabs.map((label, idx) => (
                    <Box
                        key={label}
                        role="button"
                        tabIndex={0}
                        onClick={() => setTab(idx)}
                        sx={{
                            px: 1.75, py: 0.65, borderRadius: 99, cursor: "pointer", userSelect: "none",
                            fontSize: "0.88rem", fontWeight: 700, color: "var(--sl-ink)",
                            border: "1.5px solid var(--sl-ink)",
                            bgcolor: tab === idx ? "var(--sl-accent)" : "transparent",
                            "&:hover": { bgcolor: tab === idx ? undefined : "var(--sl-soft)" }
                        }}
                    >
                        {label}
                    </Box>
                ))}
            </Box>
            {tab === 0 && (
                <Box>
                    <SectionTitle>
                        Dashboard Overview
                    </SectionTitle>
                    <Grid
                        container
                        spacing={{ xs: 1.5, md: 2 }}
                        sx={{ mb: 3 }}
                    >
                        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                            <KpiCard
                                title="Students"
                                value={dashboard.students}
                                icon={<PeopleAltIcon sx={{ color: "#16A34A" }} />}
                                iconBg="#DCFCE7"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                            <KpiCard
                                title="Teachers"
                                value={dashboard.teachers}
                                icon={<SchoolIcon sx={{ color: "#0D9488" }} />}
                                iconBg="#CCFBF1"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                            <KpiCard
                                title="Classes"
                                value={dashboard.classes}
                                icon={<MenuBookIcon sx={{ color: "#D97706" }} />}
                                iconBg="#FEF3C7"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                            <KpiCard
                                title="Attendance"
                                value={dashboard.attendance === null || dashboard.attendance === undefined ? "-" : `${dashboard.attendance}%`}
                                icon={<TaskAltIcon sx={{ color: "#7C3AED" }} />}
                                iconBg="#EDE9FE"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
                            <KpiCard
                                title="Posts Today"
                                value={dashboard.postsToday}
                                icon={<EventNoteIcon sx={{ color: "#0891B2" }} />}
                                iconBg="#CFFAFE"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4, lg: 2 }}>
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
                        spacing={{ xs: 1.5, md: 2 }}
                    >
                        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
                            <QuickActionCard
                                title="Add Student"
                                icon={<PersonAddIcon />}
                                color="#0284C7"
                                onClick={() => navigate("/students")}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
                            <QuickActionCard
                                title="Add Teacher"
                                icon={<SchoolIcon />}
                                color="#16A34A"
                                onClick={() => navigate("/teachers")}
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
                            <QuickActionCard
                                title="Attendance"
                                icon={<AssignmentTurnedInIcon />}
                                color="#EA580C"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
                            <QuickActionCard
                                title="Collect Fees"
                                icon={<PaymentsIcon />}
                                color="#7C3AED"
                            />
                        </Grid>
                        <Grid size={{ xs: 6, md: 4, lg: 2.4 }}>
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
                        spacing={{ xs: 2, md: 3 }}
                        sx={{ mb: 3 }}
                    >
                        <Grid size={{ xs: 12, md: 5 }}>
                            <CalendarCard announcements={dashboard.announcements || []} />
                        </Grid>
                        <Grid size={{ xs: 12, md: 7 }}>
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
