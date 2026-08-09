import { Card, Box, Typography } from "@mui/material";

function KpiCard({

    title,

    value,

    icon,

    iconBg,

    iconColor

}) {

    return (

        <Card

            sx={{

                p: 2.5,

                height: "100%",

                display: "flex",

                flexDirection: "column",

                gap: 1.5,

                transition: ".25s",

                "&:hover": {

                    transform: "translateY(-4px)"

                }

            }}

        >

            <Box

                sx={{

                    width: 44,

                    height: 44,

                    borderRadius: "12px",

                    bgcolor: iconBg || "#DBEAFE",

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center"

                }}

            >

                {icon}

            </Box>

            <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>

                {title}

            </Typography>

            <Typography sx={{ fontWeight: 700, fontSize: "1.9rem", lineHeight: 1 }}>

                {value}

            </Typography>

        </Card>

    );

}

export default KpiCard;
