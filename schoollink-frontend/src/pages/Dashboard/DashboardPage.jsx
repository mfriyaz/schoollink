import { useEffect, useState } from "react";

import {
    Grid,
    Box
} from "@mui/material";

import DashboardHeader from "../../components/dashboard/DashboardHeader";
import HeroCard from "../../components/dashboard/HeroCard";

import SectionTitle from "../../components/common/SectionTitle";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import PersonAddIcon from "@mui/icons-material/PersonAdd";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import PaymentsIcon from "@mui/icons-material/Payments";

import KpiCard from "../../components/dashboard/KpiCard";
import QuickActionCard from "../../components/dashboard/QuickActionCard";
import DashboardSection from "../../components/dashboard/DashboardSection";
import RecentStudentCard from "../../components/dashboard/RecentStudentCard";
import BirthdayCard from "../../components/dashboard/BirthdayCard";

import { getDashboardSummary } from "../../services/dashboardService";

const gradients = {

    blue: "linear-gradient(135deg,#2563EB,#60A5FA)",

    green: "linear-gradient(135deg,#16A34A,#4ADE80)",

    orange: "linear-gradient(135deg,#EA580C,#FB923C)",

    purple: "linear-gradient(135deg,#7C3AED,#A855F7)"

};

function DashboardPage() {

    const [dashboard, setDashboard] = useState(null);

    useEffect(() => {

        loadDashboard();

    }, []);

    async function loadDashboard() {

        try {

            const response = await getDashboardSummary();

            if (response.success) {

                setDashboard(response.data);

            }

        } catch (err) {

            console.error(err);

        }

    }

    if (!dashboard) return null;

    return (

        <Box>

            <DashboardHeader />

            <HeroCard />

            <SectionTitle>
                Dashboard Overview
            </SectionTitle>

            <Grid
                container
                spacing={3}
            >

                <Grid item xs={12} md={3}>

                    <KpiCard
                        title="Students"
                        value={dashboard.students}
                        icon={<PeopleAltIcon sx={{ fontSize: 34 }} />}
                        gradient={gradients.blue}
                    />

                </Grid>

                <Grid item xs={12} md={3}>

                    <KpiCard
                        title="Teachers"
                        value={dashboard.teachers}
                        icon={<SchoolIcon sx={{ fontSize: 34 }} />}
                        gradient={gradients.green}
                    />

                </Grid>

                <Grid item xs={12} md={3}>

                    <KpiCard
                        title="Classes"
                        value={dashboard.classes}
                        icon={<MenuBookIcon sx={{ fontSize: 34 }} />}
                        gradient={gradients.orange}
                    />

                </Grid>

                <Grid item xs={12} md={3}>

                    <KpiCard
                        title="Attendance"
                        value={`${dashboard.attendance}%`}
                        icon={<TaskAltIcon sx={{ fontSize: 34 }} />}
                        gradient={gradients.purple}
                    />

                </Grid>

            </Grid>

            <SectionTitle>

                Quick Actions

            </SectionTitle>

            <Grid
                container
                spacing={3}
                sx={{ mb: 4 }}
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

            </Grid>

            <DashboardSection

                left={
                    <RecentStudentCard
                        students={dashboard.recentStudents}
                    />
                }

                right={
                    <BirthdayCard
                        birthdays={dashboard.birthdays}
                    />
                }

            />

        </Box>

    );

}

export default DashboardPage;