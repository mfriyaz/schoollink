import { useEffect, useState } from "react";

import { Box, Card, Chip, CircularProgress, Typography } from "@mui/material";

import CampaignIcon from "@mui/icons-material/CampaignOutlined";

import { getActiveAnnouncements } from "../../services/postService";
import { resolveFileUrl } from "../../config";

function prettyDay(value) {
    if (!value) return "";
    const d = new Date(String(value).slice(0, 10) + "T00:00:00");
    if (isNaN(d)) return "";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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

        <Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                School Announcements
            </Typography>

            <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 3 }}>
                Notices from the school admin.
            </Typography>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={28} />
                </Box>
            )}

            {!loading && items.length === 0 && (
                <Card sx={{ p: 3 }}>
                    <Typography color="text.secondary">No active announcements.</Typography>
                </Card>
            )}

            <Box sx={{ display: "grid", gap: 2 }}>

                {items.map((a) => (

                    <Card key={a.id} sx={{ p: { xs: 2, sm: 3 } }}>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
                            <CampaignIcon sx={{ color: "#7C3AED" }} />
                            <Typography sx={{ fontWeight: 700, flex: 1 }}>{a.title}</Typography>
                            <Chip size="small" label={prettyDay(a.publish_date)} />
                        </Box>

                        <Typography sx={{ color: "#334155", whiteSpace: "pre-wrap", mb: (a.image_urls || []).length ? 2 : 0 }}>
                            {a.description}
                        </Typography>

                        {(a.image_urls || []).length > 0 && (
                            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 1.5 }}>
                                {a.image_urls.map((u) => (
                                    <Box
                                        key={u}
                                        component="a"
                                        href={resolveFileUrl(u)}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <Box
                                            component="img"
                                            src={resolveFileUrl(u)}
                                            alt=""
                                            sx={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 2 }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}

                    </Card>

                ))}

            </Box>

        </Box>

    );

}

export default TeacherAnnouncementsPage;
