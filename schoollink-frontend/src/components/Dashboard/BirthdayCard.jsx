import {

Card,
CardContent,
Typography,
List,
ListItem,
ListItemText

} from "@mui/material";

function BirthdayCard({ birthdays = [] }) {

    return (

        <Card>

            <CardContent>

                <Typography
                    variant="h6"
                    mb={2}
                >

                    Today's Birthdays

                </Typography>

                <List>

                    {

                        birthdays.length === 0 ?

                            (

                                <Typography>

                                    No birthdays today 🎉

                                </Typography>

                            )

                            :

                            birthdays.map(student => (

                                <ListItem key={student.id}>

                                    <ListItemText

                                        primary={`${student.first_name} ${student.last_name}`}

                                        secondary={student.class_name}

                                    />

                                </ListItem>

                            ))

                    }

                </List>

            </CardContent>

        </Card>

    );

}

export default BirthdayCard;