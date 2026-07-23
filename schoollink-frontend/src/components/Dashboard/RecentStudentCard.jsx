import {

    Avatar,

    Box,

    List,

    ListItem,

    ListItemAvatar,

    ListItemText,

    Typography

} from "@mui/material";

import AppCard from "../ui/AppCard";

function RecentStudentCard({ students }) {

    return (

        <AppCard>

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    mb: 3
                }}
            >
                Recently Added Students
            </Typography>

            <List>

                {

                    students.map((student) => (

                        <ListItem
                            key={student.id}
                            disableGutters
                        >

                            <ListItemAvatar>

                                <Avatar>

                                    {student.first_name[0]}

                                </Avatar>

                            </ListItemAvatar>

                            <ListItemText

                                primary={`${student.first_name} ${student.last_name}`}

                                secondary={student.admission_no}

                            />

                        </ListItem>

                    ))

                }

            </List>

        </AppCard>

    );

}

export default RecentStudentCard;