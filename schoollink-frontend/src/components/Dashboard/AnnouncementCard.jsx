import {

    Typography,

    Divider,

    Stack

} from "@mui/material";

import AppCard from "../ui/AppCard";

function AnnouncementCard() {

    return (

        <AppCard>

            <Typography

                variant="h6"

                sx={{

                    fontWeight: 700,

                    mb: 2

                }}

            >

                Announcements

            </Typography>

            <Stack spacing={2}>

                <div>

                    <Typography fontWeight={600}>

                        School Reopens

                    </Typography>

                    <Typography color="text.secondary">

                        Monday 8:00 AM

                    </Typography>

                </div>

                <Divider />

                <div>

                    <Typography fontWeight={600}>

                        Parent Meeting

                    </Typography>

                    <Typography color="text.secondary">

                        Friday 2 PM

                    </Typography>

                </div>

                <Divider />

                <div>

                    <Typography fontWeight={600}>

                        Sports Day

                    </Typography>

                    <Typography color="text.secondary">

                        Next Month

                    </Typography>

                </div>

            </Stack>

        </AppCard>

    );

}

export default AnnouncementCard;