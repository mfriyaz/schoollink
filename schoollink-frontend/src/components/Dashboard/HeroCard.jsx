import { Box, Typography, Button, Stack } from "@mui/material";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import AddIcon from "@mui/icons-material/Add";

function HeroCard() {

    const user =
        JSON.parse(localStorage.getItem("user"));

    const hour = new Date().getHours();

    let greeting = "Good Evening";

    if (hour < 12) greeting = "Good Morning";

    else if (hour < 18) greeting = "Good Afternoon";

    return (

        <Box

            sx={{

                background:
                    "linear-gradient(135deg,#2563EB,#4F46E5)",

                color: "white",

                borderRadius: 5,

                p: 5,

                mb: 4,

                boxShadow:
                    "0 20px 50px rgba(37,99,235,.25)"

            }}

        >

            <Stack

                direction="row"

                justifyContent="space-between"

                alignItems="center"

            >

                <Box>

                    <Typography

                        variant="h4"

                        fontWeight={700}

                    >

                        {greeting}

                        {" "}

                        {user?.full_name}

                        <WavingHandIcon

                            sx={{

                                ml:1,

                                verticalAlign:"middle"

                            }}

                        />

                    </Typography>

                    <Typography

                        sx={{

                            mt:2,

                            opacity:.9

                        }}

                    >

                        Welcome back to SchoolLink ERP.

                        Here's today's school summary.

                    </Typography>

                </Box>

                <Button

                    variant="contained"

                    startIcon={<AddIcon />}

                    sx={{

                        bgcolor:"white",

                        color:"#2563EB",

                        borderRadius:3,

                        px:4,

                        py:1.5,

                        "&:hover":{

                            bgcolor:"#F8FAFC"

                        }

                    }}

                >

                    New Student

                </Button>

            </Stack>

        </Box>

    );

}

export default HeroCard;