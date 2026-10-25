import { useEffect, useState } from "react";
import QuizTag from "../../components/common/QuizTag";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    InputAdornment,
    LinearProgress,
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
import AddIcon from "@mui/icons-material/AddOutlined";
import EventBusyIcon from "@mui/icons-material/EventBusyOutlined";
import ForumIcon from "@mui/icons-material/ForumOutlined";

import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";
import { getAllPosts, getAnnouncementById, getHomeworkById } from "../../services/postService";
import { PostViewDialog, PostEditDialog } from "../../components/Admin/PostManageDialogs";

const FILTERS = [
    { value: "", label: "All" },
    { value: "announcement", label: "Announcements" },
    { value: "homework", label: "Homework" }
];

const ANN = { color: "#DB2777", bg: "#FCE7F3" };
const HW = { color: "var(--sl-primary)", bg: "var(--sl-soft)" };

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

        <Box sx={{ maxWidth: 1000 }}>

            <Box
                onClick={() => navigate("/dashboard")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", cursor: "pointer", mb: 1.5, width: "fit-content" }}
            >
                <ArrowBackIcon fontSize="small" />
                <Typography sx={{ fontSize: "0.9rem" }}>Back to Dashboard</Typography>
            </Box>

            {/* ---------- header ---------- */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>
                <Box sx={{ width: 46, height: 46, minWidth: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ForumIcon sx={{ color: "var(--sl-ink, #0369A1)" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>Posts &amp; Announcements</Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                        Tap any item to view it. Use Edit to change it.
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" startIcon={<EventBusyIcon />} onClick={() => navigate("/announcements/expired")}>
                        Expired
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/create-announcement")}>
                        New announcement
                    </Button>
                </Box>
            </Box>

            {/* ---------- search + filter ---------- */}
            <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexWrap: "wrap", alignItems: "center" }}>

                <TextField
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    size="small"
                    sx={{ flex: 1, minWidth: 220 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: "#94A3B8" }} />
                                </InputAdornment>
                            )
                        }
                    }}
                />

                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    {FILTERS.map((f) => {
                        const active = type === f.value;
                        return (
                            <Chip
                                key={f.value}
                                label={f.label}
                                clickable
                                onClick={() => { setType(f.value); setPage(1); }}
                                sx={{
                                    fontWeight: 700,
                                    border: "1px solid",
                                    borderColor: active ? "var(--sl-ink, #111827)" : "var(--sl-border, #E2E8F0)",
                                    bgcolor: active ? "var(--sl-accent, #FFC400)" : "#fff",
                                    color: active ? "var(--sl-ink, #111827)" : "text.secondary",
                                    "&:hover": { bgcolor: active ? "var(--sl-accent, #FFC400)" : "var(--sl-soft, #F1F5F9)" }
                                }}
                            />
                        );
                    })}
                </Box>

            </Box>

            {/* ---------- list ---------- */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                    <CircularProgress size={28} />
                </Box>
            )}

            {!loading && posts.length === 0 && (
                <Card sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                        {search || type ? "No posts match your search" : "No posts yet"}
                    </Typography>
                    <Typography color="text.secondary">
                        {search || type ? "Try a different word or filter." : "Announcements and homework will appear here."}
                    </Typography>
                </Card>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

                {!loading && posts.map((post) => {

                    const isAnn = post.post_type === "announcement";
                    const tone = isAnn ? ANN : HW;
                    const hasAck = post.total_students !== null && post.total_students !== undefined;
                    const total = Number(post.total_students) || 0;
                    const done = Number(post.acknowledged_count) || 0;
                    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

                    return (

                        <Box
                            key={`${post.post_type}-${post.id}`}
                            data-testid="post-row"
                            onClick={() => setViewPost(post)}
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", sm: "row" },
                                alignItems: { xs: "stretch", sm: "center" },
                                gap: { xs: 1, sm: 1.75 },
                                p: 1.5,
                                pl: 2,
                                borderRadius: 3,
                                cursor: "pointer",
                                bgcolor: "#fff",
                                border: "1px solid var(--sl-border, #E2E8F0)",
                                borderLeft: `4px solid ${tone.color}`,
                                boxShadow: "var(--sl-card-shadow, none)",
                                "&:hover": { boxShadow: "var(--sl-card-shadow-hover, 0 4px 14px rgba(0,0,0,0.10))" }
                            }}
                        >

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>

                                <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: tone.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                    {isAnn
                                        ? <CampaignIcon sx={{ color: tone.color }} fontSize="small" />
                                        : <MenuBookIcon sx={{ color: tone.color }} fontSize="small" />}
                                </Box>

                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 700,
                                            overflowWrap: "anywhere",
                                            display: "-webkit-box",
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: "vertical",
                                            overflow: "hidden"
                                        }}
                                    >
                                        {post.title}
                                    </Typography>
                                    <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>
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
                                    {!isAnn && <Box sx={{ mt: 0.5 }}><QuizTag post={post} variant="staff" /></Box>}
                                </Box>

                            </Box>

                            {/* acknowledgement progress */}
                            <Box sx={{ width: { xs: "100%", sm: 170 }, flexShrink: 0 }}>
                                {hasAck ? (
                                    <>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                            <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, color: "#166534" }}>
                                                {done}/{total} acknowledged
                                            </Typography>
                                            {Number(post.pending_count) > 0 && (
                                                <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, color: "#B45309" }}>
                                                    {post.pending_count} pending
                                                </Typography>
                                            )}
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={pct}
                                            sx={{
                                                height: 6,
                                                borderRadius: 3,
                                                bgcolor: "#E2E8F0",
                                                "& .MuiLinearProgress-bar": { bgcolor: pct === 100 ? "#16A34A" : "#F59E0B", borderRadius: 3 }
                                            }}
                                        />
                                    </>
                                ) : (
                                    <Chip size="small" label={post.target_audience} sx={{ bgcolor: "var(--sl-soft, var(--sl-soft))", fontWeight: 600 }} />
                                )}
                            </Box>

                            <Box sx={{ display: "flex", gap: 0.5, justifyContent: { xs: "flex-end", sm: "flex-start" } }}>
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

                    );

                })}

            </Box>

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
