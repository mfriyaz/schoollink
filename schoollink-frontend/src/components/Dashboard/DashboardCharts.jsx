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

                }

            },

            stroke: {

                curve: "smooth",

                width: 4

            },

            colors: ["#2563EB"],

            xaxis: {

                categories: [

                    "Jan",
                    "Feb",
                    "Mar",
                    "Apr",
                    "May",
                    "Jun"

                ]

            },

            dataLabels: {

                enabled: false

            },

            grid: {

                borderColor: "#ECEFF5"

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

            sx={{ mt: 2 }}

        >

            <Grid

                item

                xs={12}

                md={8}

            >

                <Paper

                    sx={{

                        p: 3,

                        borderRadius: 4,

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

                md={4}

            >

                <Paper

                    sx={{

                        p: 3,

                        borderRadius: 4,

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