import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    Badge,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    InputAdornment,
    TextField,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";

import {
    getMyChildren,
    getHomeworkForStudent,
    getAnnouncementsForStudent
} from "../../services/postService";

import { toUtcDate, formatPostTime, getSchoolTimezone } from "../../utils/dateUtils";

function ParentAllUpdatesPage() {

    const navigate = useNavigate();

    const location = useLocation();

    const [children, setChildren] = useState([]);

    const [selectedStudentId, setSelectedStudentId] = useState(

        location.state?.studentId || ""

    );

    const [posts, setPosts] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    const [postFilter, setPostFilter] = useState("all");

    useEffect(() => {

        loadChildren();

    }, []);

    async function loadChildren() {

        try {

            const response = await getMyChildren();

            if (response.success && response.data.length > 0) {

                setChildren(response.data);

                const studentId = selectedStudentId || response.data[0].student_id;

                setSelectedStudentId(studentId);

                await loadPosts(studentId);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    async function loadPosts(studentId) {

        try {

            const [homeworkResponse, announcementResponse] = await Promise.all([

                getHomeworkForStudent(studentId),

                getAnnouncementsForStudent(studentId)

            ]);

            const homework = homeworkResponse.success

                ? homeworkResponse.data.map((p) => ({ ...p, post_type: "homework" }))

                : [];

            const announcements = announcementResponse.success

                ? announcementResponse.data.map((p) => ({ ...p, post_type: "announcement" }))

                : [];

            const merged = [...homework, ...announcements].sort(

                (a, b) => toUtcDate(b.created_at) - toUtcDate(a.created_at)

            );

            setPosts(merged);

        } catch (err) {

            console.error(err);

        }

    }

    const filteredPosts = posts

        .filter((p) => postFilter === "all" || p.post_type === postFilter)

        .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));

    if (loading) {

        return (

            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                <CircularProgress />

            </Box>

        );

    }

    return (

        <Box sx={{ maxWidth: 800 }}>

            <Box
                onClick={() => navigate("/parent/dashboard")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", cursor: "pointer", mb: 2, width: "fit-content" }}
            >

                <ArrowBackIcon fontSize="small" />

                <Typography sx={{ fontSize: "0.9rem" }}>Back to Dashboard</Typography>

            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>

                All Updates

            </Typography>

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 3 }}>

                <TextField
                    size="small"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{

                        startAdornment: (

                            <InputAdornment position="start">

                                <SearchIcon fontSize="small" />

                            </InputAdornment>

                        )

                    }}
                    sx={{ minWidth: 220 }}
                />

                <Badge badgeContent={posts.length} color="primary" overlap="rectangular">

                    <Button
                        size="small"
                        variant={postFilter === "all" ? "contained" : "outlined"}
                        onClick={() => setPostFilter("all")}
                        sx={{ pr: 2 }}
                    >

                        All

                    </Button>

                </Badge>

                <Badge badgeContent={posts.filter((p) => p.post_type !== "announcement").length} color="primary" overlap="rectangular">

                    <Button
                        size="small"
                        variant={postFilter === "homework" ? "contained" : "outlined"}
                        onClick={() => setPostFilter("homework")}
                        sx={{ pr: 2 }}
                    >

                        Homework

                    </Button>

                </Badge>

                <Badge badgeContent={posts.filter((p) => p.post_type === "announcement").length} color="primary" overlap="rectangular">

                    <Button
                        size="small"
                        variant={postFilter === "announcement" ? "contained" : "outlined"}
                        onClick={() => setPostFilter("announcement")}
                        sx={{ pr: 2 }}
                    >

                        Announcements

                    </Button>

                </Badge>

            </Box>

            <Card sx={{ p: 3 }}>

                {filteredPosts.length === 0 && (

                    <Typography color="text.secondary">

                        No updates found.

                    </Typography>

                )}

                {filteredPosts.map((post) => {

                    const isAnnouncement = post.post_type === "announcement";

                    return (

                        <Box

                            key={`${post.post_type}-${post.id}`}

                            onClick={() => navigate(

                                `/parent/post/${post.post_type}/${post.id}/${selectedStudentId}`,

                                { state: { post, student: children.find((c) => c.student_id === selectedStudentId) } }

                            )}

                            sx={{

                                display: "flex",

                                alignItems: "center",

                                justifyContent: "space-between",

                                py: 2,

                                px: 1,

                                cursor: "pointer",

                                borderRadius: 2,

                                borderBottom: "1px solid #F1F5F9",

                                "&:hover": { bgcolor: "#F8FAFC" },

                                "&:last-of-type": { borderBottom: "none" }

                            }}

                        >

                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                                <Box

                                    sx={{

                                        width: 40,

                                        height: 40,

                                        borderRadius: "10px",

                                        bgcolor: isAnnouncement ? "#EDE9FE" : "#DBEAFE",

                                        display: "flex",

                                        alignItems: "center",

                                        justifyContent: "center",

                                        flexShrink: 0

                                    }}

                                >

                                    {isAnnouncement

                                        ? <CampaignIcon sx={{ color: "#7C3AED", fontSize: 20 }} />

                                        : <MenuBookIcon sx={{ color: "#2563EB", fontSize: 20 }} />}

                                </Box>

                                <Box>

                                    <Typography sx={{ fontWeight: 600 }}>

                                        {post.title}

                                    </Typography>

                                    <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>

                                        {isAnnouncement
                                            ? `Announcement · ${post.target_audience}`
                                            : `${post.teacher_first_name} ${post.teacher_last_name} · ${post.subject_name}`}

                                    </Typography>

                                </Box>

                            </Box>

                            <Box sx={{ textAlign: "right" }}>

                                <Chip
                                    size="small"
                                    color={post.is_acknowledged ? "success" : post.require_acknowledgement === false ? "default" : "warning"}
                                    label={post.is_acknowledged ? "Acknowledged" : post.require_acknowledgement === false ? "No Action Needed" : "Pending"}
                                    sx={{ fontWeight: 600 }}
                                />

                                <Typography sx={{ color: "#94A3B8", fontSize: "0.72rem", mt: 0.5 }}>

                                    {formatPostTime(post.created_at)}

                                </Typography>

                            </Box>

                        </Box>

                    );

                })}

            </Card>

        </Box>

    );

}

export default ParentAllUpdatesPage;
