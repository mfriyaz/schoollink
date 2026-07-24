import Chart from "react-apexcharts";

import {
    Grid,
    Paper,
    Typography
} from "@mui/material";

function DashboardCharts() {

    const admissionChart = {

        options: {

            chart: {
                toolbar: {
                    show: false
                },
                zoom: {
                    enabled: false
                }
            },

            stroke: {
                curve: "smooth",
                width: 4
            },

            fill: {
                type: "gradient",
                gradient: {
                    shadeIntensity: 1,
                    opacityFrom: 0.45,
                    opacityTo: 0.05
                }
            },

            colors: ["#2563EB"],

            dataLabels: {
                enabled: false
            },

            grid: {
                borderColor: "#ECEFF5"
            },

            xaxis: {
                categories: [
                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun"
                ]
            }

        },

        series: [
            {
                name: "Students",
                data: [
                    12,
                    18,
                    25,
                    32,
                    40,
                    51
                ]
            }
        ]

    };

    const attendanceChart = {

        options: {

            labels: [
                "Present",
                "Absent"
            ],

            colors: [
                "#16A34A",
                "#EF4444"
            ],

            legend: {
                position: "bottom"
            },

            dataLabels: {
                enabled: true
            }

        },

        series: [
            97,
            3
        ]

    };

    return (

        <Grid
            container
            spacing={3}
            sx={{ mt: 2, mb: 2 }}
        >

            <Grid
                item
                xs={12}
                lg={8}
            >

                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        border: "1px solid #EEF2F7",
                        boxShadow: "0 10px 30px rgba(0,0,0,.05)"
                    }}
                >

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={2}
                    >
                        Student Admission Trend
                    </Typography>

                    <Chart
                        options={admissionChart.options}
                        series={admissionChart.series}
                        type="area"
                        height={320}
                    />

                </Paper>

            </Grid>

            <Grid
                item
                xs={12}
                lg={4}
            >

                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        borderRadius: 4,
                        border: "1px solid #EEF2F7",
                        boxShadow: "0 10px 30px rgba(0,0,0,.05)"
                    }}
                >

                    <Typography
                        variant="h6"
                        fontWeight={700}
                        mb={2}
                    >
                        Today's Attendance
                    </Typography>

                    <Chart
                        options={attendanceChart.options}
                        series={attendanceChart.series}
                        type="donut"
                        height={320}
                    />

                </Paper>

            </Grid>

        </Grid>

    );

}

export default DashboardCharts;