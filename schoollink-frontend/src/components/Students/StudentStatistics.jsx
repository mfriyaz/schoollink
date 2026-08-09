import { Grid } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import BoyIcon from "@mui/icons-material/Boy";
import GirlIcon from "@mui/icons-material/Girl";
import SchoolIcon from "@mui/icons-material/School";

import KpiCard from "../Dashboard/KpiCard";

export default function StudentStatistics({ students }) {

    const total = students.length;

    const boys = students.filter(x => x.gender === "Male").length;

    const girls = students.filter(x => x.gender === "Female").length;

    const active = students.filter(x => x.is_active).length;

    return (

        <Grid container spacing={3} sx={{ mb: 3 }}>

            <Grid item xs={12} sm={6} md={3}>
                <KpiCard
                    title="Total Students"
                    value={total}
                    icon={<PeopleIcon sx={{ color: "#2563EB" }} />}
                    iconBg="#DBEAFE"
                />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <KpiCard
                    title="Boys"
                    value={boys}
                    icon={<BoyIcon sx={{ color: "#2563EB" }} />}
                    iconBg="#DBEAFE"
                />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <KpiCard
                    title="Girls"
                    value={girls}
                    icon={<GirlIcon sx={{ color: "#DB2777" }} />}
                    iconBg="#FCE7F3"
                />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
                <KpiCard
                    title="Active"
                    value={active}
                    icon={<SchoolIcon sx={{ color: "#16A34A" }} />}
                    iconBg="#DCFCE7"
                />
            </Grid>

        </Grid>

    );

}
