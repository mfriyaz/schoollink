import {

    Timeline,

    TimelineItem,

    TimelineSeparator,

    TimelineDot,

    TimelineContent

} from "@mui/lab";

import {

    Typography

} from "@mui/material";

import AppCard from "../ui/AppCard";

function RecentActivityCard(){

    return(

        <AppCard>

            <Typography

                variant="h6"

                sx={{

                    fontWeight:700,

                    mb:2

                }}

            >

                Recent Activities

            </Typography>

            <Timeline>

                <TimelineItem>

                    <TimelineSeparator>

                        <TimelineDot color="primary"/>

                    </TimelineSeparator>

                    <TimelineContent>

                        Student Added

                    </TimelineContent>

                </TimelineItem>

                <TimelineItem>

                    <TimelineSeparator>

                        <TimelineDot color="success"/>

                    </TimelineSeparator>

                    <TimelineContent>

                        Teacher Assigned

                    </TimelineContent>

                </TimelineItem>

                <TimelineItem>

                    <TimelineSeparator>

                        <TimelineDot color="warning"/>

                    </TimelineSeparator>

                    <TimelineContent>

                        Attendance Updated

                    </TimelineContent>

                </TimelineItem>

            </Timeline>

        </AppCard>

    );

}

export default RecentActivityCard;