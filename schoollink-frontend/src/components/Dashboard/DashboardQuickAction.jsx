import {
    Grid,
    Typography
} from "@mui/material";

import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import SchoolIcon from "@mui/icons-material/School";
import FactCheckIcon from "@mui/icons-material/FactCheck";
import PaymentsIcon from "@mui/icons-material/Payments";

import AppCard from "../ui/AppCard";

const actions = [

    {
        title: "New Student",
        icon: <PersonAddAlt1Icon fontSize="large" />,
        color: "#2563EB"
    },

    {
        title: "New Teacher",
        icon: <SchoolIcon fontSize="large" />,
        color: "#16A34A"
    },

    {
        title: "Attendance",
        icon: <FactCheckIcon fontSize="large" />,
        color: "#EA580C"
    },

    {
        title: "Fees",
        icon: <PaymentsIcon fontSize="large" />,
        color: "#9333EA"
    }

];

function DashboardQuickActions() {

    return (

        <Grid container spacing={3}>

            {

                actions.map((item) => (

                    <Grid
                        item
                        xs={12}
                        sm={6}
                        md={3}
                        key={item.title}
                    >

                        <AppCard

                            sx={{

                                cursor: "pointer",

                                textAlign: "center",

                                py: 5

                            }}

                        >

                            <div

                                style={{

                                    color: item.color,

                                    marginBottom: 12

                                }}

                            >

                                {item.icon}

                            </div>

                            <Typography

                                sx={{

                                    fontWeight: 700

                                }}

                            >

                                {item.title}

                            </Typography>

                        </AppCard>

                    </Grid>

                ))

            }

        </Grid>

    );

}

export default DashboardQuickActions;