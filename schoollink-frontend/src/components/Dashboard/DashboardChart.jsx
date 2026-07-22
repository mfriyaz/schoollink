import {
    Card,
    CardContent,
    Typography
} from "@mui/material";

import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from "recharts";

const data = [

    { month: "Jan", students: 18 },
    { month: "Feb", students: 22 },
    { month: "Mar", students: 15 },
    { month: "Apr", students: 27 },
    { month: "May", students: 20 },
    { month: "Jun", students: 32 }

];

function DashboardChart() {

    return (

        <Card>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >
                    Student Admissions
                </Typography>

                <ResponsiveContainer
                    width="100%"
                    height={300}
                >

                    <LineChart data={data}>

                        <CartesianGrid strokeDasharray="3 3" />

                        <XAxis dataKey="month" />

                        <YAxis />

                        <Tooltip />

                        <Line

                            type="monotone"

                            dataKey="students"

                            stroke="#1976d2"

                            strokeWidth={3}

                        />

                    </LineChart>

                </ResponsiveContainer>

            </CardContent>

        </Card>

    );

}

export default DashboardChart;