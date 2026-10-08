import { useNavigate } from "react-router-dom";
import { Box, Chip, Typography } from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CampaignIcon from "@mui/icons-material/Campaign";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";
import PanelCard, { EmptyState } from "./PanelCard";

function RecentPostsCard({ posts }) {
    const navigate = useNavigate();
    const list = posts || [];

    return (
        <PanelCard
            title="Recent Posts"
            subtitle="Latest posts and announcements"
            action={
                <Typography
                    onClick={() => navigate("/posts")}
                    sx={{
                        color: "#2563EB",
                        fontWeight: 600,
                        fontSize: "0.82rem",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                        "&:hover": { textDecoration: "underline" }
                    }}
                >
                    View all
                </Typography>
            }
        >
            {list.length === 0 && (
                <EmptyState icon={<EventNoteIcon />} text="No posts yet." />
            )}

            {list.map((post, index) => {
                const isAnnouncement = post.post_type === "announcement";

                return (
                    <Box
                        key={`${post.post_type}-${post.id}`}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            py: 1.25,
                            borderTop: index === 0 ? "none" : "1px solid #F1F5F9"
                        }}
                    >
                        <Box
                            sx={{
                                width: 36,
                                height: 36,
                                minWidth: 36,
                                borderRadius: "10px",
                                bgcolor: isAnnouncement ? "#FCE7F3" : "#DBEAFE",
                                color: isAnnouncement ? "#DB2777" : "#2563EB",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                "& svg": { fontSize: 19 }
                            }}
                        >
                            {isAnnouncement ? <CampaignIcon /> : <MenuBookIcon />}
                        </Box>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                                sx={{
                                    fontWeight: 600,
                                    fontSize: "0.9rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}
                            >
                                {post.title}
                            </Typography>
                            <Typography
                                sx={{
                                    color: "#64748B",
                                    fontSize: "0.76rem",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis"
                                }}
                            >
                                {isAnnouncement
                                    ? "Announcement · All Classes"
                                    : `${post.class_name} - ${post.section_name} · ${post.subject_name}`}
                            </Typography>
                        </Box>

                        <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                            {post.total_students === null ? (
                                <Chip
                                    size="small"
                                    label={post.target_audience}
                                    sx={{ height: 22, fontSize: "0.72rem" }}
                                />
                            ) : (
                                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                    <Chip
                                        size="small"
                                        label={`${post.acknowledged_count}/${post.total_students}`}
                                        sx={{
                                            height: 22,
                                            fontSize: "0.72rem",
                                            fontWeight: 600,
                                            bgcolor: "#DCFCE7",
                                            color: "#15803D"
                                        }}
                                    />
                                    {post.pending_count > 0 && (
                                        <Chip
                                            size="small"
                                            label={`${post.pending_count} pending`}
                                            sx={{
                                                height: 22,
                                                fontSize: "0.72rem",
                                                fontWeight: 600,
                                                bgcolor: "#FFEDD5",
                                                color: "#C2410C",
                                                display: { xs: "none", sm: "inline-flex" }
                                            }}
                                        />
                                    )}
                                </Box>
                            )}
                            <Typography sx={{ color: "#94A3B8", fontSize: "0.7rem", mt: 0.5 }}>
                                {toUtcDate(post.created_at).toLocaleDateString(undefined, {
                                    timeZone: getSchoolTimezone(),
                                    month: "short",
                                    day: "numeric"
                                })}
                            </Typography>
                        </Box>
                    </Box>
                );
            })}
        </PanelCard>
    );
}

export default RecentPostsCard;
