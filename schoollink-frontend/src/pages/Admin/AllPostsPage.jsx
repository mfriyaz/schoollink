import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    InputAdornment,
    Pagination,
    TextField,
    Typography
} from "@mui/material";

import SearchIcon from "@mui/icons-material/SearchOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";

import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";
import { getAllPosts, getAnnouncementById, getHomeworkById } from "../../services/postService";
import { PostViewDialog, PostEditDialog } from "../../components/Admin/PostManageDialogs";

const FILTERS = [
    { value: "", label: "All" },
    { value: "announcement", label: "Announcements" },
    { value: "homework", label: "Homework" }
];

function AllPostsPage() {

    const navigate = useNavigate();

    const [posts, setPosts] = useState([]);
    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);

    const [viewPost, setViewPost] = useState(null);
    const [editPost, setEditPost] = useState(null);
    const [editRecord, setEditRecord] = useState(null);

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

    async function startEdit(post) {
        try {
            const response = post.post_type === "announcement"
                ? await getAnnouncementById(post.id)
                : await getHomeworkById(post.id);
            if (response.success) {
                setEditPost(post);
                setEditRecord(response.data);
            }
        } catch (err) {
            console.error(err);
        }
    }

    function openEdit(post, record) {
        setEditPost(post);
        setEditRecord(record);
        setViewPost(null);
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

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Posts &amp; Announcements
            </Typography>

            <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 3 }}>
                Click any item to view it. Use Edit to change it.
            </Typography>

            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap", alignItems: "center" }}>

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

                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {FILTERS.map((f) => (
                        <Chip
                            key={f.value}
                            label={f.label}
                            clickable
                            onClick={() => { setType(f.value); setPage(1); }}
                            sx={{
                                fontWeight: 600,
                                bgcolor: type === f.value ? "#1D4ED8" : "#F1F5F9",
                                color: type === f.value ? "white" : "#475569",
                                "&:hover": { bgcolor: type === f.value ? "#1E40AF" : "#E2E8F0" }
                            }}
                        />
                    ))}
                </Box>

            </Box>

            <Card sx={{ p: { xs: 1, sm: 2 } }}>

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress size={28} />
                    </Box>
                )}

                {!loading && posts.length === 0 && (
                    <Typography color="text.secondary" sx={{ p: 2 }}>
                        No posts match your search.
                    </Typography>
                )}

                {!loading && posts.map((post) => {

                    const isAnn = post.post_type === "announcement";

                    return (

                        <Box
                            key={`${post.post_type}-${post.id}`}
                            onClick={() => setViewPost(post)}
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "stretch", sm: "center" },
                                justifyContent: "space-between",
                                gap: { xs: 1, sm: 1.5 },
                                p: 1.5,
                                borderRadius: 2,
                                cursor: "pointer",
                                borderBottom: "1px solid #F1F5F9",
                                "&:hover": { bgcolor: "#F8FAFC" }
                            }}
                        >

                            <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0, flex: 1 }}>

                                <Avatar sx={{ bgcolor: isAnn ? "#EDE9FE" : "#DBEAFE" }}>
                                    {isAnn
                                        ? <CampaignIcon sx={{ color: "#7C3AED" }} fontSize="small" />
                                        : <MenuBookIcon sx={{ color: "#2563EB" }} fontSize="small" />}
                                </Avatar>

                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 600,
                                            overflowWrap: "anywhere",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden"
                                        }}
                                    >
                                        {post.title}
                                    </Typography>
                                    <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
                                        {isAnn
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

                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: { xs: "space-between", sm: "flex-end" },
                                    flexWrap: "wrap",
                                    gap: 1,
                                    pl: { xs: 0, sm: 0 }
                                }}
                            >

                                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>

                                    {post.total_students === null ? (
                                        <Chip size="small" label={post.target_audience} />
                                    ) : (
                                        <>
                                            <Chip size="small" color="success" label={`${post.acknowledged_count}/${post.total_students}`} />
                                            <Chip size="small" color="warning" label={`${post.pending_count} Pending`} />
                                        </>
                                    )}

                                </Box>

                                <Box sx={{ display: "flex", gap: 0.5 }}>

                                    <Button
                                        size="small"
                                        startIcon={<VisibilityIcon fontSize="small" />}
                                        onClick={(e) => { e.stopPropagation(); setViewPost(post); }}
                                    >
                                        View
                                    </Button>

                                    <Button
                                        size="small"
                                        startIcon={<EditIcon fontSize="small" />}
                                        onClick={(e) => { e.stopPropagation(); startEdit(post); }}
                                    >
                                        Edit
                                    </Button>

                                </Box>

                            </Box>

                        </Box>

                    );

                })}

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

            <PostViewDialog
                open={!!viewPost}
                post={viewPost}
                onClose={() => setViewPost(null)}
                onEdit={(record) => openEdit(viewPost, record)}
                onDeleted={() => { setViewPost(null); loadPosts(); }}
            />

            <PostEditDialog
                open={!!editPost}
                post={editPost}
                record={editRecord}
                onClose={() => { setEditPost(null); setEditRecord(null); }}
                onSaved={() => { setEditPost(null); setEditRecord(null); loadPosts(); }}
            />

        </Box>

    );

}

export default AllPostsPage;
