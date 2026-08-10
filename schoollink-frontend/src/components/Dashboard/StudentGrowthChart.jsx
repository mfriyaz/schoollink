import Chart from "react-apexcharts";

import AppCard from "../ui/AppCard";

import { Typography } from "@mui/material";

function StudentGrowthChart() {

    const options = {

        chart: {

            toolbar: {

                show:false

            }

        },

        labels:[

            "Grade 1",

            "Grade 2",

            "Grade 3",

            "Grade 4",

            "Grade 5"

        ],

        colors:[

            "#2563EB",

            "#16A34A",

            "#EA580C",

            "#9333EA",

            "#E11D48"

        ]

    };

    const series=[35,42,28,31,26];

    return(

        <AppCard>

            <Typography

                variant="h6"

                sx={{

                    mb:3,

                    fontWeight:700

                }}

            >

                Student Distribution

            </Typography>

            <Chart

                type="donut"

                height={320}

                width="100%"

                options={options}

                series={series}

            />

        </AppCard>

    );

}

export default StudentGrowthChart;