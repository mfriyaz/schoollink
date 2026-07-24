import {
    Paper,
    Typography,
    List,
    ListItem,
    Divider,
    Box
} from "@mui/material";

import CampaignIcon from "@mui/icons-material/Campaign";

function AnnouncementCard({ announcements = [] }) {

    return (

        <Paper
            sx={{
                p: 3,
                borderRadius: 4,
                boxShadow: "0 10px 30px rgba(0,0,0,.05)",
                height: "100%"
            }}
        >

            <Typography
                variant="h6"
                fontWeight={700}
                mb={2}
            >
                Announcements
            </Typography>

            <List>

                {
                    announcements.map((item, index) => (

                        <Box key={item.id}>

                            <ListItem
                                sx={{
                                    alignItems: "flex-start"
                                }}
                            >

                                <CampaignIcon
                                    sx={{
                                        color: "#2563EB",
                                        mr: 2,
                                        mt: .5
                                    }}
                                />

                                <Box>

                                    <Typography
                                        fontWeight={700}
                                    >
                                        {item.title}
                                    </Typography>

                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                    >
                                        {item.description}
                                    </Typography>

                                </Box>

                            </ListItem>

                            {
                                index !== announcements.length - 1 &&
                                <Divider />
                            }

                        </Box>

                    ))
                }

            </List>

        </Paper>

    );

}

export default AnnouncementCard;