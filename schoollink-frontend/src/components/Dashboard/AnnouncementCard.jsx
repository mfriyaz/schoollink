import { Box, Typography } from "@mui/material";
import CampaignIcon from "@mui/icons-material/Campaign";
import PanelCard, { EmptyState } from "./PanelCard";

function AnnouncementCard({ announcements = [] }) {
    return (
        <PanelCard title="Announcements" subtitle="Active school announcements">
            {announcements.length === 0 && (
                <EmptyState icon={<CampaignIcon />} text="No announcements right now." />
            )}

            {announcements.map((item, index) => (
                <Box
                    key={item.id}
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
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
                            bgcolor: "#DBEAFE",
                            color: "#2563EB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            "& svg": { fontSize: 19 }
                        }}
                    >
                        <CampaignIcon />
                    </Box>

                    <Box sx={{ minWidth: 0 }}>
                        <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                            {item.title}
                        </Typography>
                        <Typography
                            sx={{
                                color: "#64748B",
                                fontSize: "0.8rem",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden"
                            }}
                        >
                            {item.description}
                        </Typography>
                    </Box>
                </Box>
            ))}
        </PanelCard>
    );
}

export default AnnouncementCard;
