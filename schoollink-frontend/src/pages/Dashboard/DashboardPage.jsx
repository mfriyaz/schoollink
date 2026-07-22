import { useEffect, useState } from "react";

import {

    Grid,
    Typography,
    Paper,
    Box,
    List,
    ListItem,
    ListItemText

} from "@mui/material";

import DashboardCard from "../../components/Dashboard/DashboardCard";

import { getDashboard } from "../../services/dashboardService";

function DashboardPage() {

    const [dashboard, setDashboard] = useState({

        students: 0,

        teachers: 0,

        classes: 0,

        attendance: 0,

        recentStudents: [],

        birthdays: []

    });

    useEffect(() => {

        loadDashboard();

    }, []);

    async function loadDashboard() {

        try {

            const response = await getDashboard();

            if (response.success) {

                setDashboard(response.data);

            }

        }

        catch (err) {

            console.error(err);

        }

    }

    return (

        <Box sx={{ p: 3 }}>

            <Typography

                variant="h4"

                mb={3}

            >

                Dashboard

            </Typography>

            <Grid

                container

                spacing={3}

            >

                <Grid size={{ xs: 12, md: 3 }}>

                    <DashboardCard

                        title="Students"

                        value={dashboard.students}

                        color="#1976d2"

                    />

                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>

                    <DashboardCard

                        title="Teachers"

                        value={dashboard.teachers}

                        color="#43a047"

                    />

                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>

                    <DashboardCard

                        title="Classes"

                        value={dashboard.classes}

                        color="#ef6c00"

                    />

                </Grid>

                <Grid size={{ xs: 12, md: 3 }}>

                    <DashboardCard

                        title="Attendance"

                        value={`${dashboard.attendance}%`}

                        color="#8e24aa"

                    />

                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>

                    <Paper sx={{ p: 2 }}>

                        <Typography variant="h6">

                            Recently Added Students

                        </Typography>

                        <List>

                            {

                                dashboard.recentStudents.map(student => (

                                    <ListItem key={student.id}>

                                        <ListItemText

                                            primary={`${student.first_name} ${student.last_name}`}

                                            secondary={student.admission_no}

                                        />

                                    </ListItem>

                                ))

                            }

                        </List>

                    </Paper>

                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>

                    <Paper sx={{ p: 2 }}>

                        <Typography variant="h6">

                            Today's Birthdays

                        </Typography>

                        {

                            dashboard.birthdays.length === 0 ?

                                (

                                    <Typography mt={2}>

                                        No birthdays today 🎉

                                    </Typography>

                                )

                                :

                                (

                                    <List>

                                        {

                                            dashboard.birthdays.map(student => (

                                                <ListItem key={student.id}>

                                                    <ListItemText

                                                        primary={`${student.first_name} ${student.last_name}`}

                                                    />

                                                </ListItem>

                                            ))

                                        }

                                    </List>

                                )

                        }

                    </Paper>

                </Grid>

            </Grid>

        </Box>

    );

}

export default DashboardPage;