import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Avatar,
    Box,
    Card,
    Chip,
    CircularProgress,
    InputAdornment,
    MenuItem,
    Pagination,
    TextField,
    Typography
} from "@mui/material";

import SearchIcon from "@mui/icons-material/SearchOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";

import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";

import { getAllPosts } from "../../services/postService";

function AllPostsPage() {

    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);

    const [search, setSearch] = useState("");

    const [type, setType] = useState("");

    const [page, setPage] = useState(1);

    const [totalPages, setTotalPages] = useState(1);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const timeout = setTimeout(loadPosts, 300);

        return () => clearTimeout(timeout);

    }, [search, type, page]);

    async function loadPosts() {

        try {

            setLoading(true);

            const response = await getAllPosts({ search, type, page });

            if (response.success) {

                setPosts(response.data.posts);

                setTotalPages(response.data.totalPages);

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
                onClick={() => navigate("/dashboard")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", cursor: "pointer", mb: 2, width: "fit-content" }}
            >

                <ArrowBackIcon fontSize="small" />

                <Typography sx={{ fontSize: "0.9rem" }}>Back to Dashboard</Typography>

            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>

                All Posts

            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>

                <TextField
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    size="small"
                    sx={{ minWidth: 260 }}
                    InputProps={{

                        startAdornment: (

                            <InputAdornment position="start">

                                <SearchIcon fontSize="small" sx={{ color: "#94A3B8" }} />

                            </InputAdornment>

                        )

                    }}
                />

                <TextField
                    select
                    size="small"
                    value={type}
                    onChange={(e) => { setType(e.target.value); setPage(1); }}
                    sx={{ minWidth: 180 }}
                >

                    <MenuItem value="">All Types</MenuItem>

                    <MenuItem value="homework">Homework</MenuItem>

                    <MenuItem value="announcement">Announcements</MenuItem>

                </TextField>

            </Box>

            <Card sx={{ p: 3 }}>

                {loading && (

                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>

                        <CircularProgress size={28} />

                    </Box>

                )}

                {!loading && posts.length === 0 && (

                    <Typography color="text.secondary">

                        No posts match your search.

                    </Typography>

                )}

                {!loading && posts.map((post) => (

                    <Box

                        key={`${post.post_type}-${post.id}`}

                        sx={{

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "space-between",

                            py: 2,

                            borderBottom: "1px solid #F1F5F9",

                            "&:last-of-type": { borderBottom: "none" }

                        }}

                    >

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                            <Avatar sx={{ bgcolor: post.post_type === "announcement" ? "#EDE9FE" : "#DBEAFE" }}>

                                {post.post_type === "announcement" ? (

                                    <CampaignIcon sx={{ color: "#7C3AED" }} fontSize="small" />

                                ) : (

                                    <MenuBookIcon sx={{ color: "#2563EB" }} fontSize="small" />

                                )}

                            </Avatar>

                            <Box>

                                <Typography sx={{ fontWeight: 600 }}>

                                    {post.title}

                                </Typography>

                                <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>

                                    {post.post_type === "announcement"
                                        ? `Announcement · ${post.target_audience}`
                                        : `${post.class_name} - ${post.section_name} · ${post.subject_name}`}

                                    {" · "}

                                    {toUtcDate(post.created_at).toLocaleDateString(undefined, {

                                        timeZone: getSchoolTimezone(),

                                        month: "short",

                                        day: "numeric",

                                        year: "numeric"

                                    })}

                                </Typography>

                            </Box>

                        </Box>

                        {post.total_students === null ? (

                            <Chip size="small" label={post.target_audience} />

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

                    </Box>

                ))}

                {totalPages > 1 && (

                    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>

                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={(e, value) => setPage(value)}
                            color="primary"
                        />

                    </Box>

                )}

            </Card>

        </Box>

    );

}

export default AllPostsPage;
