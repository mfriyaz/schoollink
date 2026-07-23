import { Card, Box, Typography } from "@mui/material";

function KpiCard({

    title,

    value,

    icon,

    gradient

}) {

    return (

        <Card

            sx={{

                borderRadius: 5,

                overflow: "hidden",

                background: gradient,

                color: "#fff",

                height: 170,

                position: "relative",

                boxShadow: "0 20px 45px rgba(0,0,0,.18)",

                transition: ".35s",

                "&:hover": {

                    transform: "translateY(-8px)"

                }

            }}

        >

            <Box

                sx={{

                    p: 3,

                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "center"

                }}

            >

                <Box>

                    <Typography

                        sx={{

                            opacity: .85,

                            fontSize: 15

                        }}

                    >

                        {title}

                    </Typography>

                    <Typography

                        variant="h3"

                        fontWeight={700}

                        mt={1}

                    >

                        {value}

                    </Typography>

                </Box>

                <Box

                    sx={{

                        width: 70,

                        height: 70,

                        borderRadius: "50%",

                        bgcolor: "rgba(255,255,255,.18)",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center"

                    }}

                >

                    {icon}

                </Box>

            </Box>

        </Card>

    );

}

export default KpiCard;