import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    CircularProgress,
    InputAdornment,
    TextField,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import {
    getMyChildren,
    getHomeworkForStudent,
    getAnnouncementsForStudent
} from "../../services/postService";
import { toUtcDate, formatPostTime, getSchoolTimezone } from "../../utils/dateUtils";
const pillSx = (active) => ({
    px: 1.5, py: 0.55, borderRadius: 99, cursor: "pointer", userSelect: "none",
    fontSize: "0.82rem", fontWeight: 700, display: "flex", alignItems: "center", gap: 0.75,
    border: "1.5px solid var(--sl-ink)",
    bgcolor: active ? "var(--sl-accent)" : "transparent",
    color: "var(--sl-ink)",
    "&:hover": { bgcolor: active ? undefined : "var(--sl-soft)" }
});

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
    const schoolTz = getSchoolTimezone();
    function dayLabel(dateValue) {
        const d = toUtcDate(dateValue);
        const key = (x) => x.toLocaleDateString("en-CA", { timeZone: schoolTz });
        const now = new Date();
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        if (key(d) === key(now)) return "Today";
        if (key(d) === key(yesterday)) return "Yesterday";
        return d.toLocaleDateString(undefined, {
            timeZone: schoolTz,
            weekday: "short",
            day: "numeric",
            month: "short"
        });
    }
    const filters = [
        { value: "all", label: "All", count: posts.length },
        { value: "homework", label: "Homework", count: posts.filter((p) => p.post_type !== "announcement").length },
        { value: "announcement", label: "Announcements", count: posts.filter((p) => p.post_type === "announcement").length }
    ];
    // Group the (already newest-first) list by day
    const groups = [];
    filteredPosts.forEach((post) => {
        const label = dayLabel(post.created_at);
        const last = groups[groups.length - 1];
        if (last && last.label === label) {
            last.items.push(post);
        } else {
            groups.push({ label, items: [post] });
        }
    });
    const selectedChild = children.find((c) => c.student_id === selectedStudentId);
    return (
        <Box sx={{ maxWidth: 820, pb: 3 }}>
            <Box role="button" tabIndex={0} onClick={() => navigate("/parent/dashboard")} sx={{ ...pillSx(false), display: "inline-flex", mb: 1.5 }}>
                <ArrowBackIcon sx={{ fontSize: 18 }} />
                Dashboard
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 46, height: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CampaignIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>
                        All Updates
                    </Typography>
                    {selectedChild && (
                        <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                            {selectedChild.first_name} {selectedChild.last_name} · {selectedChild.class_name} - {selectedChild.section_name}
                        </Typography>
                    )}
                </Box>
            </Box>
            {children.length > 1 && (
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                    {children.map((c) => (
                        <Box key={c.student_id} role="button" tabIndex={0}
                            onClick={() => { setSelectedStudentId(c.student_id); loadPosts(c.student_id); }}
                            sx={pillSx(c.student_id === selectedStudentId)}>
                            {c.first_name}
                        </Box>
                    ))}
                </Box>
            )}
            <TextField
                fullWidth
                size="small"
                placeholder="Search updates by title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        )
                    }
                }}
                sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: 3, bgcolor: "#fff" } }}
            />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
                {filters.map((f) => {
                    const active = postFilter === f.value;
                    return (
                        <Box key={f.value} role="button" tabIndex={0} onClick={() => setPostFilter(f.value)} sx={pillSx(active)}>
                            {f.label}
                            <Box component="span" sx={{ px: 0.7, borderRadius: 99, fontSize: "0.72rem", bgcolor: active ? "var(--sl-ink)" : "var(--sl-soft2)", color: active ? "#fff" : "var(--sl-ink)" }}>
                                {f.count}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
            {filteredPosts.length === 0 && (
                <Box sx={{ py: 6, textAlign: "center", color: "text.secondary", bgcolor: "#fff", border: "1.5px dashed var(--sl-ink)", borderRadius: 3 }}>
                    <MenuBookIcon sx={{ fontSize: 36, mb: 0.5, color: "var(--sl-ink)" }} />
                    <Typography sx={{ fontSize: "0.9rem" }}>No updates found.</Typography>
                </Box>
            )}
            {groups.map((group) => (
                <Box key={group.label} sx={{ mb: 2.5 }}>
                    <Typography sx={{ color: "var(--sl-ink)", fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.6, textTransform: "uppercase", mb: 1, px: 0.5 }}>
                        {group.label}
                    </Typography>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {group.items.map((post) => {
                            const isAnnouncement = post.post_type === "announcement";
                            const noAction = !post.is_acknowledged && post.require_acknowledgement === false;
                            const statusLabel = post.is_acknowledged ? "Acknowledged" : noAction ? "No action needed" : "Pending";
                            const statusStyle = post.is_acknowledged
                                ? { bgcolor: "#DCFCE7", color: "#15803D" }
                                : noAction
                                    ? { bgcolor: "var(--sl-soft)", color: "text.secondary" }
                                    : { bgcolor: "#FFEDD5", color: "#C2410C" };
                            return (
                                <Box
                                    key={`${post.post_type}-${post.id}`}
                                    data-testid="update-row"
                                    onClick={() => navigate(
                                        `/parent/post/${post.post_type}/${post.id}/${selectedStudentId}`,
                                        { state: { post, student: selectedChild } }
                                    )}
                                    sx={{
                                        display: "flex", alignItems: "center", gap: 1.5,
                                        px: { xs: 1.5, md: 2 }, py: 1.5, bgcolor: "#fff",
                                        border: "1px solid var(--sl-border)", borderLeft: "6px solid var(--sl-accent)",
                                        borderRadius: 3, boxShadow: "var(--sl-card-shadow)",
                                        cursor: "pointer", transition: ".15s",
                                        "&:hover": { transform: "translateY(-1px)" }
                                    }}
                                >
                                    <Box sx={{ width: 40, height: 40, minWidth: 40, borderRadius: "12px", bgcolor: isAnnouncement ? "var(--sl-soft2)" : "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                        {isAnnouncement
                                            ? <CampaignIcon sx={{ color: "var(--sl-ink)", fontSize: 21 }} />
                                            : <MenuBookIcon sx={{ color: "var(--sl-ink)", fontSize: 21 }} />}
                                    </Box>
                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", lineHeight: 1.3, color: "var(--sl-ink)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                                            {post.title}
                                        </Typography>
                                        <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", mt: 0.25, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {isAnnouncement
                                                ? `Announcement · ${post.target_audience}`
                                                : `${post.teacher_first_name} ${post.teacher_last_name} · ${post.subject_name}`}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                                        <Box component="span" sx={{ display: "inline-block", px: 1, py: 0.15, borderRadius: 99, fontSize: "0.72rem", fontWeight: 700, ...statusStyle }}>
                                            {statusLabel}
                                        </Box>
                                        <Typography sx={{ color: "text.secondary", fontSize: "0.7rem", mt: 0.5 }}>
                                            {formatPostTime(post.created_at)}
                                        </Typography>
                                    </Box>
                                    <ChevronRightIcon sx={{ color: "var(--sl-ink)", fontSize: 20, display: { xs: "none", sm: "block" } }} />
                                </Box>
                            );
                        })}
                    </Box>
                </Box>
            ))}
        </Box>
    );
}

export default ParentAllUpdatesPage;
