import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Avatar,
    Box,
    Card,
    Chip,
    CircularProgress,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";

import { getExpiredAnnouncements } from "../../services/postService";

import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";

function ExpiredAnnouncementsPage() {

    const navigate = useNavigate();

    const [announcements, setAnnouncements] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadExpired();

    }, []);

    async function loadExpired() {

        try {

            setLoading(true);

            const response = await getExpiredAnnouncements();

            if (response.success) {

                setAnnouncements(response.data);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    return (

        <Box>

            <Box
                onClick={() => navigate("/posts")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", cursor: "pointer", mb: 2, width: "fit-content" }}
            >

                <ArrowBackIcon fontSize="small" />

                <Typography sx={{ fontSize: "0.9rem" }}>Back to All Posts</Typography>

            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>

                Expired Announcements

            </Typography>

            <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 3 }}>

                Announcements past their expiry date - no longer shown in the active feed for teachers/parents.

            </Typography>

            <Card sx={{ p: 3 }}>

                {loading && (

                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>

                        <CircularProgress size={28} />

                    </Box>

                )}

                {!loading && announcements.length === 0 && (

                    <Typography color="text.secondary">

                        No expired announcements.

                    </Typography>

                )}

                {!loading && announcements.map((a) => (

                    <Box

                        key={a.id}

                        sx={{

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "space-between",

                            flexWrap: "wrap",

                            gap: 1.5,

                            py: 2,

                            borderBottom: "1px solid #F1F5F9",

                            "&:last-of-type": { borderBottom: "none" },

                            opacity: 0.75

                        }}

                    >

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>

                            <Avatar sx={{ bgcolor: "#F1F5F9" }}>

                                <CampaignIcon sx={{ color: "#94A3B8" }} fontSize="small" />

                            </Avatar>

                            <Box sx={{ minWidth: 0 }}>

                                <Typography sx={{ fontWeight: 600, wordBreak: "break-word" }}>

                                    {a.title}

                                </Typography>

                                <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>

                                    {a.target_audience}

                                </Typography>

                            </Box>

                        </Box>

                        <Chip

                            size="small"

                            label={`Expired ${toUtcDate(a.expiry_date).toLocaleDateString(undefined, { timeZone: getSchoolTimezone() })}`}

                        />

                    </Box>

                ))}

            </Card>

        </Box>

    );

}

export default ExpiredAnnouncementsPage;
