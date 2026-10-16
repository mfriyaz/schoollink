import { useEffect, useState } from "react";
import { Box, Card, CircularProgress, Typography } from "@mui/material";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import { getActiveAnnouncements } from "../../services/postService";
import { resolveFileUrl } from "../../config";
function prettyDay(value) {
    if (!value) return "";
    const d = new Date(String(value).slice(0, 10) + "T00:00:00");
    if (isNaN(d)) return "";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}
function daysAgo(value) {
    if (!value) return null;
    const d = new Date(String(value).slice(0, 10) + "T00:00:00");
    if (isNaN(d)) return null;
    return Math.floor((Date.now() - d.getTime()) / 86400000);
}

function TeacherAnnouncementsPage() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        (async () => {
            try {
                const response = await getActiveAnnouncements("Teachers");
                if (response.success) setItems(response.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);
    return (
        <Box sx={{ maxWidth: 800 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <Box
                    sx={{
                        width: 46, height: 46, borderRadius: "14px",
                        bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)",
                        boxShadow: "2px 2px 0 var(--sl-ink)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                >
                    <CampaignIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>
                        School Announcements
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        Notices from the school admin.
                    </Typography>
                </Box>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={28} />
                </Box>
            )}

            {!loading && items.length === 0 && (
                <Card sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px solid var(--sl-border)" }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Nothing new</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: "0.9rem" }}>
                        There are no active announcements right now.
                    </Typography>
                </Card>
            )}

            <Box sx={{ display: "grid", gap: 1.75 }}>
                {items.map((a) => {
                    const age = daysAgo(a.publish_date);
                    const isNew = age !== null && age <= 2;
                    return (
                        <Card
                            key={a.id}
                            data-testid="announcement"
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                borderRadius: 3,
                                border: "1px solid var(--sl-border)",
                                borderLeft: "6px solid var(--sl-accent)",
                                boxShadow: "var(--sl-card-shadow)"
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1 }}>
                                <Box
                                    sx={{
                                        width: 38, height: 38, minWidth: 38, borderRadius: "12px",
                                        bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)",
                                        display: "flex", alignItems: "center", justifyContent: "center"
                                    }}
                                >
                                    <CampaignIcon sx={{ color: "var(--sl-ink)", fontSize: 20 }} />
                                </Box>
                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 800, color: "var(--sl-ink)", wordBreak: "break-word" }}>{a.title}</Typography>
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                                        <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{prettyDay(a.publish_date)}</Typography>
                                        {isNew && (
                                            <Box sx={{ px: 1, py: 0.1, borderRadius: 99, fontSize: "0.7rem", fontWeight: 800, bgcolor: "var(--sl-ink)", color: "#fff" }}>
                                                NEW
                                            </Box>
                                        )}
                                    </Box>
                                </Box>
                            </Box>

                            <Typography sx={{ color: "text.primary", whiteSpace: "pre-wrap", wordBreak: "break-word", mb: (a.image_urls || []).length ? 2 : 0 }}>
                                {a.description}
                            </Typography>

                            {(a.image_urls || []).length > 0 && (
                                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 1.25 }}>
                                    {a.image_urls.map((u) => (
                                        <Box key={u} component="a" href={resolveFileUrl(u)} target="_blank" rel="noreferrer">
                                            <Box
                                                component="img"
                                                src={resolveFileUrl(u)}
                                                alt=""
                                                sx={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 2, border: "1px solid var(--sl-border)" }}
                                            />
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Card>
                    );
                })}
            </Box>
        </Box>
    );
}

export default TeacherAnnouncementsPage;
