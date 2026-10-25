import { useEffect, useState } from "react";
import QuizTag from "../../components/common/QuizTag";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Card,
    CircularProgress,
    LinearProgress,
    TextField,
    Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import StatChips from "../../components/common/StatChips";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PhotoCameraIcon from "@mui/icons-material/PhotoCameraOutlined";
import {
    getMyTeacherProfile,
    getMyAssignments,
    getHomeworkByAssignment,
    getHomeworkAckSummary
} from "../../services/postService";
import PendingStudentsDialog from "../../components/Teacher/PendingStudentsDialog";
import AcknowledgedStudentsDialog from "../../components/Teacher/AcknowledgedStudentsDialog";
import SubmissionsDialog from "../../components/Teacher/SubmissionsDialog";
import { getSubmissionCount } from "../../services/homeworkSubmissionService";
import { formatPostTime, toUtcDate } from "../../utils/dateUtils";
import { resolveFileUrl } from "../../config";
function TeacherPostsPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [pendingDialogPost, setPendingDialogPost] = useState(null);
    const [acknowledgedDialogPost, setAcknowledgedDialogPost] = useState(null);
    const [submissionsDialogPost, setSubmissionsDialogPost] = useState(null);
    const [submissionCounts, setSubmissionCounts] = useState({});
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [classFilter, setClassFilter] = useState("all");
    useEffect(() => {
        loadPosts();
    }, []);
    async function loadPosts() {
        try {
            const profileResponse = await getMyTeacherProfile();
            if (!profileResponse.success) {
                setLoading(false);
                return;
            }
            const assignmentsResponse = await getMyAssignments(
                profileResponse.data.id
            );
            const assignments = assignmentsResponse.success
                ? assignmentsResponse.data
                : [];
            const postsWithCounts = [];
            for (const assignment of assignments) {
                const homeworkResponse = await getHomeworkByAssignment(
                    assignment.teacher_subject_id
                );
                if (!homeworkResponse.success) {
                    continue;
                }
                for (const hw of homeworkResponse.data) {
                    const summaryResponse = await getHomeworkAckSummary(
                        hw.id
                    );
                    postsWithCounts.push({
                        ...hw,
                        class_name: assignment.class_name,
                        section_name: assignment.section_name,
                        subject_name: assignment.subject_name,
                        summary: summaryResponse.success ? summaryResponse.data : null
                    });
                }
            }
            postsWithCounts.sort(
                (a, b) => toUtcDate(b.created_at) - toUtcDate(a.created_at)
            );
            setPosts(postsWithCounts);
            const countEntries = await Promise.all(
                postsWithCounts.map(async (p) => {
                    try {
                        const countResponse = await getSubmissionCount(p.id);
                        return [p.id, countResponse.success ? countResponse.data.count : 0];
                    } catch (err) {
                        return [p.id, 0];
                    }
                })
            );
            setSubmissionCounts(Object.fromEntries(countEntries));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    const classOptions = Array.from(
        new Map(
            posts.map((p) => [`${p.class_name}-${p.section_name}`, `${p.class_name}-${p.section_name}`])
        ).values()
    );

    const pendingPosts = posts.filter((p) => p.summary && p.summary.pending_count > 0).length;
    const donePosts = posts.filter((p) => p.summary && p.summary.pending_count === 0).length;

    const term = search.trim().toLowerCase();

    const visible = posts.filter((p) => {
        if (classFilter !== "all" && `${p.class_name}-${p.section_name}` !== classFilter) return false;
        if (statusFilter === "pending" && !(p.summary && p.summary.pending_count > 0)) return false;
        if (statusFilter === "done" && !(p.summary && p.summary.pending_count === 0)) return false;
        if (term && !`${p.title} ${p.subject_name} ${p.class_name} ${p.section_name}`.toLowerCase().includes(term)) return false;
        return true;
    });

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
                    <MenuBookIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>
                        All My Posts
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        Homework you have shared, and how parents are responding.
                    </Typography>
                </Box>
            </Box>

            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={28} />
                </Box>
            )}

            {!loading && posts.length === 0 && (
                <Card sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px solid var(--sl-border)" }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No posts yet</Typography>
                    <Typography color="text.secondary" sx={{ fontSize: "0.9rem", mb: 2 }}>
                        Create your first homework post to see it here.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate("/teacher/create-post")}>Create Post</Button>
                </Card>
            )}

            {!loading && posts.length > 0 && (
                <>
                    <StatChips
                        active={statusFilter}
                        onPick={(f) => setStatusFilter(f === statusFilter ? "all" : f)}
                        items={[
                            { label: "Posts", value: posts.length, filter: "all" },
                            { label: "Awaiting parents", value: pendingPosts, filter: "pending", tone: "#C2410C" },
                            { label: "All acknowledged", value: donePosts, filter: "done", tone: "#15803D" }
                        ]}
                    />

                    <TextField
                        size="small"
                        fullWidth
                        placeholder="Search by title, class or subject"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ mb: 1.5 }}
                        slotProps={{
                            input: {
                                startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.secondary" }} />
                            }
                        }}
                    />

                    {classOptions.length > 1 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
                            {["all", ...classOptions].map((c) => (
                                <Box
                                    key={c}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => setClassFilter(c)}
                                    onKeyDown={(e) => e.key === "Enter" && setClassFilter(c)}
                                    sx={{
                                        px: 1.5, py: 0.5, borderRadius: 99, cursor: "pointer", userSelect: "none",
                                        fontSize: "0.82rem", fontWeight: 700, border: "1.5px solid var(--sl-ink)",
                                        bgcolor: classFilter === c ? "var(--sl-accent)" : "transparent",
                                        color: "var(--sl-ink)"
                                    }}
                                >
                                    {c === "all" ? "All classes" : c}
                                </Box>
                            ))}
                        </Box>
                    )}

                    <Card sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                        {visible.length === 0 && (
                            <Typography color="text.secondary" sx={{ textAlign: "center", py: 2 }}>
                                No posts match your filters.
                            </Typography>
                        )}
                        {visible.map((post) => {
                            const total = post.summary ? post.summary.total_students : 0;
                            const acked = post.summary ? post.summary.acknowledged_count : 0;
                            const pend = post.summary ? post.summary.pending_count : 0;
                            const pct = total > 0 ? Math.round((acked / total) * 100) : 0;
                            return (
                                <Box
                                    key={post.id}
                                    data-testid="teacher-post"
                                    sx={{ py: 1.75, borderBottom: "1px solid var(--sl-border)", "&:last-of-type": { borderBottom: "none" } }}
                                >
                                    <Box
                                        onClick={() => navigate(`/teacher/posts/${post.id}`)}
                                        sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, cursor: "pointer" }}
                                    >
                                        <Box
                                            sx={{
                                                width: 40, height: 40, minWidth: 40, borderRadius: "12px",
                                                bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)",
                                                display: "flex", alignItems: "center", justifyContent: "center"
                                            }}
                                        >
                                            <MenuBookIcon sx={{ color: "var(--sl-ink)", fontSize: 20 }} />
                                        </Box>
                                        <Box sx={{ minWidth: 0, flex: 1 }}>
                                            <Typography sx={{ fontWeight: 700, wordBreak: "break-word" }}>{post.title}</Typography>
                                            <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                                                {post.class_name} - {post.section_name} · {post.subject_name} · {formatPostTime(post.created_at)}
                                            </Typography>
                                            <Box sx={{ mt: 0.5 }}>
                                                <QuizTag post={post} variant="staff" onClick={() => navigate(`/teacher/posts/${post.id}/quiz-results`)} />
                                            </Box>
                                            {post.image_urls && post.image_urls.length > 0 && (
                                                <Box sx={{ display: "flex", gap: 0.75, mt: 1 }}>
                                                    {post.image_urls.map((url, i) => (
                                                        <Box
                                                            key={i}
                                                            component="img"
                                                            loading="lazy"
                                                            src={resolveFileUrl(url)}
                                                            sx={{ width: 36, height: 36, objectFit: "cover", borderRadius: 1.5, border: "1px solid var(--sl-border)" }}
                                                        />
                                                    ))}
                                                </Box>
                                            )}
                                        </Box>
                                    </Box>

                                    {post.summary && (
                                        <Box sx={{ mt: 1.25, ml: { sm: 6.5 } }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={pct}
                                                sx={{ height: 7, borderRadius: 4, mb: 1, bgcolor: "var(--sl-soft2)", "& .MuiLinearProgress-bar": { bgcolor: "#16A34A" } }}
                                            />
                                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                                                <Box
                                                    onClick={() => acked > 0 && setAcknowledgedDialogPost(post)}
                                                    sx={{ px: 1.25, py: 0.35, borderRadius: 99, fontSize: "0.78rem", fontWeight: 700, color: "#15803D", bgcolor: "#DCFCE7", cursor: acked > 0 ? "pointer" : "default" }}
                                                >
                                                    {acked}/{total} acknowledged
                                                </Box>
                                                <Box
                                                    onClick={() => pend > 0 && setPendingDialogPost(post)}
                                                    sx={{ px: 1.25, py: 0.35, borderRadius: 99, fontSize: "0.78rem", fontWeight: 700, color: "#C2410C", bgcolor: "#FFEDD5", cursor: pend > 0 ? "pointer" : "default" }}
                                                >
                                                    {pend} pending
                                                </Box>
                                                <Box
                                                    onClick={() => setSubmissionsDialogPost(post)}
                                                    sx={{ display: "flex", alignItems: "center", gap: 0.75, px: 1.25, py: 0.35, borderRadius: 99, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer", border: "1.5px solid var(--sl-ink)", color: "var(--sl-ink)" }}
                                                >
                                                    <PhotoCameraIcon sx={{ fontSize: 16 }} />
                                                    Submissions
                                                    <Box component="span" sx={{ px: 0.75, borderRadius: 99, bgcolor: (submissionCounts[post.id] || 0) > 0 ? "#DC2626" : "var(--sl-soft2)", color: (submissionCounts[post.id] || 0) > 0 ? "#fff" : "inherit" }}>
                                                        {submissionCounts[post.id] || 0}
                                                    </Box>
                                                </Box>
                                            </Box>
                                        </Box>
                                    )}
                                </Box>
                            );
                        })}
                    </Card>
                </>
            )}

            <SubmissionsDialog
                open={Boolean(submissionsDialogPost)}
                post={submissionsDialogPost}
                onClose={() => setSubmissionsDialogPost(null)}
            />
            <PendingStudentsDialog
                open={Boolean(pendingDialogPost)}
                post={pendingDialogPost}
                onClose={() => setPendingDialogPost(null)}
            />
            <AcknowledgedStudentsDialog
                open={Boolean(acknowledgedDialogPost)}
                post={acknowledgedDialogPost}
                onClose={() => setAcknowledgedDialogPost(null)}
            />
        </Box>
    );
}

export default TeacherPostsPage;
