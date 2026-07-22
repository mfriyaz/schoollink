import {

Card,
CardContent,
Typography,
Stack,
Button

} from "@mui/material";

import {

PersonAdd,
School,
Payments,
FactCheck

} from "@mui/icons-material";

function QuickActions() {

    return (

        <Card>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >

                    Quick Actions

                </Typography>

                <Stack spacing={2}>

                    <Button
                        startIcon={<PersonAdd />}
                        variant="contained"
                    >
                        Add Student
                    </Button>

                    <Button
                        startIcon={<School />}
                        variant="outlined"
                    >
                        Add Teacher
                    </Button>

                    <Button
                        startIcon={<Payments />}
                        variant="outlined"
                    >
                        Collect Fee
                    </Button>

                    <Button
                        startIcon={<FactCheck />}
                        variant="outlined"
                    >
                        Attendance
                    </Button>

                </Stack>

            </CardContent>

        </Card>

    );

}

export default QuickActions;