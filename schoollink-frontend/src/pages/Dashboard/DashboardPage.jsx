import { useEffect, useState } from "react";

import {
    Grid,
    Box
} from "@mui/material";

import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import SchoolIcon from "@mui/icons-material/School";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import TaskAltIcon from "@mui/icons-material/TaskAlt";

import PageTitle from "../../components/common/PageTitle";

import DashboardStatCard from "../../components/dashboard/DashboardStatCard";

import DashboardSection from "../../components/dashboard/DashboardSection";

import RecentStudentCard from "../../components/dashboard/RecentStudentCard";

import BirthdayCard from "../../components/dashboard/BirthdayCard";

import { getDashboardSummary } from "../../services/dashboardService";

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

        }

        catch (err) {

            console.error(err);

        }

    }

    if (!dashboard) return null;

    return (

        <Box>

            <PageTitle

                title="Dashboard"

                subtitle="Welcome back to SchoolLink ERP"

            />

            <Grid
                container
                spacing={3}
            >

                <Grid item xs={12} md={3}>

                    <DashboardStatCard

                        title="Students"

                        value={dashboard.students}

                        icon={<PeopleAltIcon fontSize="large" />}

                        color="#2563EB"

                    />

                </Grid>

                <Grid item xs={12} md={3}>

                    <DashboardStatCard

                        title="Teachers"

                        value={dashboard.teachers}

                        icon={<SchoolIcon fontSize="large" />}

                        color="#16A34A"

                    />

                </Grid>

                <Grid item xs={12} md={3}>

                    <DashboardStatCard

                        title="Classes"

                        value={dashboard.classes}

                        icon={<MenuBookIcon fontSize="large" />}

                        color="#EA580C"

                    />

                </Grid>

                <Grid item xs={12} md={3}>

                    <DashboardStatCard

                        title="Attendance"

                        value={`${dashboard.attendance}%`}

                        icon={<TaskAltIcon fontSize="large" />}

                        color="#9333EA"

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