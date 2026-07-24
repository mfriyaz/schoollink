import { Paper, Typography, Box } from "@mui/material";

function CalendarCard() {

    const today = new Date();

    return (

        <Paper

            sx={{

                p:3,

                borderRadius:4,

                boxShadow:"0 8px 30px rgba(0,0,0,.05)",

                height:"100%"

            }}

        >

            <Typography

                variant="h6"

                fontWeight={700}

                mb={3}

            >

                Calendar

            </Typography>

            <Box

                sx={{

                    display:"flex",

                    justifyContent:"center",

                    alignItems:"center",

                    height:220,

                    bgcolor:"#F8FAFC",

                    borderRadius:3

                }}

            >

                <Typography

                    variant="h3"

                    fontWeight={700}

                >

                    {today.getDate()}

                </Typography>

            </Box>

        </Paper>

    );

}

export default CalendarCard;