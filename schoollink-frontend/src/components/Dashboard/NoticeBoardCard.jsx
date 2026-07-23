import {

    Typography,

    Stack,

    Chip

} from "@mui/material";

import AppCard from "../ui/AppCard";

function NoticeBoardCard() {

    return (

        <AppCard>

            <Typography

                variant="h6"

                sx={{

                    fontWeight: 700,

                    mb: 2

                }}

            >

                Notice Board

            </Typography>

            <Stack spacing={2}>

                <Chip label="Exam Schedule Published" />

                <Chip label="Fee Reminder" />

                <Chip label="Holiday Circular" />

            </Stack>

        </AppCard>

    );

}

export default NoticeBoardCard;