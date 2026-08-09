import Chart from "react-apexcharts";

import { Typography } from "@mui/material";

import AppCard from "../ui/AppCard";

const sliceColors = ["#2563EB", "#16A34A", "#EA580C", "#7C3AED", "#DB2777"];

function PendingAcknowledgementsChart({ pendingByClass }) {

    const data = pendingByClass || [];

    const total = data.reduce((sum, row) => sum + row.pending_count, 0);

    const chart = {

        options: {

            labels: data.map((row) => row.class_name),

            colors: sliceColors,

            legend: {

                position: "bottom"

            },

            dataLabels: {

                enabled: false

            },

            plotOptions: {

                pie: {

                    donut: {

                        size: "70%",

                        labels: {

                            show: true,

                            total: {

                                show: true,

                                label: "Pending",

                                formatter: () => total

                            }

                        }

                    }

                }

            }

        },

        series: data.map((row) => row.pending_count)

    };

    return (

        <AppCard>

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    mb: 3
                }}
            >
                Pending Acknowledgements
            </Typography>

            {total === 0 ? (

                <Typography color="text.secondary">

                    No pending acknowledgements right now.

                </Typography>

            ) : (

                <Chart
                    options={chart.options}
                    series={chart.series}
                    type="donut"
                    height={280}
                />

            )}

        </AppCard>

    );

}

export default PendingAcknowledgementsChart;
