import { Grid } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BoyIcon from "@mui/icons-material/Boy";
import GirlIcon from "@mui/icons-material/Girl";
import SchoolIcon from "@mui/icons-material/School";

import KpiCard from "../dashboard/KpiCard";

const gradients = {

    blue: "linear-gradient(135deg,#2563EB,#60A5FA)",

    green: "linear-gradient(135deg,#16A34A,#4ADE80)",

    pink: "linear-gradient(135deg,#DB2777,#F472B6)",

    orange: "linear-gradient(135deg,#EA580C,#FB923C)"

};

export default function StudentStatistics({ students }) {

    const total = students.length;

    const boys = students.filter(x => x.gender === "Male").length;

    const girls = students.filter(x => x.gender === "Female").length;

    return (

        <Grid container spacing={3} sx={{ mb: 3 }}>

            <Grid item xs={12} md={3}>
                <KpiCard
                    title="Total Students"
                    value={total}
                    icon={<PeopleIcon sx={{ fontSize: 34 }} />}
                    gradient={gradients.blue}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <KpiCard
                    title="Boys"
                    value={boys}
                    icon={<BoyIcon sx={{ fontSize: 34 }} />}
                    gradient={gradients.green}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <KpiCard
                    title="Girls"
                    value={girls}
                    icon={<GirlIcon sx={{ fontSize: 34 }} />}
                    gradient={gradients.pink}
                />
            </Grid>

            <Grid item xs={12} md={3}>
                <KpiCard
                    title="Classes"
                    value="6"
                    icon={<SchoolIcon sx={{ fontSize: 34 }} />}
                    gradient={gradients.orange}
                />
            </Grid>

        </Grid>

    );

}