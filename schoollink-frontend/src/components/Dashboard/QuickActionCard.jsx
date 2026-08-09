import {
    Card,
    CardActionArea,
    Typography,
    Box
} from "@mui/material";

function QuickActionCard({

    title,

    icon,

    color,

    onClick

}) {

    return (

        <Card

            sx={{

                borderRadius: 4,

                boxShadow: "0 8px 30px rgba(0,0,0,.06)",

                transition: ".25s",

                "&:hover": {

                    transform: "translateY(-5px)"

                }

            }}

        >

            <CardActionArea

                onClick={onClick}

                sx={{

                    p: 3,

                    textAlign: "center"

                }}

            >

                <Box

                    sx={{

                        width: 60,

                        height: 60,

                        mx: "auto",

                        mb: 2,

                        borderRadius: "50%",

                        bgcolor: color,

                        color: "white",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center"

                    }}

                >

                    {icon}

                </Box>

                <Typography

                    fontWeight={700}

                >

                    {title}

                </Typography>

            </CardActionArea>

        </Card>

    );

}

export default QuickActionCard;