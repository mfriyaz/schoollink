import { useNavigate } from "react-router-dom";

import {
    Avatar,
    Box,
    Chip,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Typography
} from "@mui/material";

import MenuBookIcon from "@mui/icons-material/MenuBook";

import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";

import AppCard from "../ui/AppCard";

function RecentPostsCard({ posts }) {

    const navigate = useNavigate();

    return (

        <AppCard>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>

                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 700
                    }}
                >
                    Recent Posts
                </Typography>

                <Typography

                    onClick={() => navigate("/posts")}

                    sx={{

                        color: "#2563EB",

                        fontWeight: 600,

                        fontSize: "0.85rem",

                        cursor: "pointer"

                    }}

                >

                    View All

                </Typography>

            </Box>

            {(!posts || posts.length === 0) && (

                <Typography color="text.secondary">

                    No posts yet.

                </Typography>

            )}

            <List>

                {

                    (posts || []).map((post) => (

                        <ListItem
                            key={`${post.post_type}-${post.id}`}
                            disableGutters
                            secondaryAction={

                                <Box sx={{ textAlign: "right" }}>

                                    {post.total_students === null ? (

                                        <Chip
                                            size="small"
                                            label={post.target_audience}
                                        />

                                    ) : (

                                        <Box sx={{ display: "flex", gap: 1 }}>

                                            <Chip
                                                size="small"
                                                color="success"
                                                label={`${post.acknowledged_count}/${post.total_students}`}
                                            />

                                            <Chip
                                                size="small"
                                                color="warning"
                                                label={`${post.pending_count} Pending`}
                                            />

                                        </Box>

                                    )}

                                    <Typography sx={{ color: "#94A3B8", fontSize: "0.72rem", mt: 0.5 }}>

                                        {toUtcDate(post.created_at).toLocaleDateString(undefined, {

                                            timeZone: getSchoolTimezone(),

                                            month: "short",

                                            day: "numeric"

                                        })}

                                    </Typography>

                                </Box>

                            }
                        >

                            <ListItemAvatar>

                                <Avatar>

                                    <MenuBookIcon fontSize="small" />

                                </Avatar>

                            </ListItemAvatar>

                            <ListItemText

                                primary={post.title}

                                secondary={

                                    post.post_type === "announcement"
                                        ? "Announcement · All Classes"
                                        : `${post.class_name} - ${post.section_name} · ${post.subject_name}`

                                }

                            />

                        </ListItem>

                    ))

                }

            </List>

        </AppCard>

    );

}

export default RecentPostsCard;
