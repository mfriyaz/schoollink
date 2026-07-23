import {

    Avatar,

    List,

    ListItem,

    ListItemAvatar,

    ListItemText,

    Typography

} from "@mui/material";

import AppCard from "../ui/AppCard";

function BirthdayCard({ birthdays }) {

    return (

        <AppCard>

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    mb: 3
                }}
            >
                🎉 Today's Birthdays
            </Typography>

            {

                birthdays.length === 0

                    ?

                    <Typography color="text.secondary">

                        No birthdays today

                    </Typography>

                    :

                    <List>

                        {

                            birthdays.map((student) => (

                                <ListItem key={student.id}>

                                    <ListItemAvatar>

                                        <Avatar>

                                            {student.first_name[0]}

                                        </Avatar>

                                    </ListItemAvatar>

                                    <ListItemText

                                        primary={`${student.first_name} ${student.last_name}`}

                                    />

                                </ListItem>

                            ))

                        }

                    </List>

            }

        </AppCard>

    );

}

export default BirthdayCard;