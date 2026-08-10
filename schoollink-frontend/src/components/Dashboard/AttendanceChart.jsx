import Chart from "react-apexcharts";

import AppCard from "../ui/AppCard";

import { Typography } from "@mui/material";

function AttendanceChart() {

    const options = {

        chart: {

            toolbar: {

                show: false

            }

        },

        colors: ["#2563EB"],

        stroke: {

            curve: "smooth",

            width: 4

        },

        xaxis: {

            categories: [

                "Mon",

                "Tue",

                "Wed",

                "Thu",

                "Fri",

                "Sat"

            ]

        },

        grid: {

            borderColor: "#EEF2F7"

        }

    };

    const series = [

        {

            name: "Attendance",

            data: [92,95,94,97,96,98]

        }

    ];

    return (

        <AppCard>

            <Typography

                variant="h6"

                sx={{

                    mb:3,

                    fontWeight:700

                }}

            >

                Weekly Attendance

            </Typography>

            <Chart

                type="line"

                height={320}

                width="100%"

                options={options}

                series={series}

            />

        </AppCard>

    );

}

export default AttendanceChart;