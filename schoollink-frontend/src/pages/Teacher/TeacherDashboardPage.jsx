import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CircularProgress,
    FormControlLabel,
    Grid,
    LinearProgress,
    Menu,
    MenuItem,
    Switch,
    Tooltip,
    Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PhotoCameraIcon from "@mui/icons-material/PhotoCameraOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PendingActionsIcon from "@mui/icons-material/PendingActionsOutlined";
import GroupsIcon from "@mui/icons-material/GroupsOutlined";
import ClassIcon from "@mui/icons-material/ClassOutlined";
import {
    getMyTeacherProfile,
    getMyAssignments,
    getHomeworkByAssignment,
    getHomeworkAckSummary
} from "../../services/postService";
import PendingStudentsDialog from "../../components/Teacher/PendingStudentsDialog";
import AcknowledgedStudentsDialog from "../../components/Teacher/AcknowledgedStudentsDialog";
import SubmissionsDialog from "../../components/Teacher/SubmissionsDialog";
import GreetingReactionPicker, { reactions } from "../../components/Teacher/GreetingReactionPicker";
import { getSubmissionCount } from "../../services/homeworkSubmissionService";
import { getTodaysGreetingsForClassTeacher, bulkReactToGreetings, getSharedGreetingsSetting, setSharedGreetingsSetting } from "../../services/morningGreetingService";
import { formatPostTime, toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";
import { resolveFileUrl } from "../../config";
function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
}
function getUser() {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
}
function getTitledName(teacher, user) {
    if (!teacher) {
        return user ? user.full_name : "Teacher";
    }
    const title = teacher.gender === "Male" ? "Mr." : "Mrs.";
    return `${title} ${teacher.last_name || teacher.first_name}`;
}
function KpiCard({ icon, label, value, linkLabel, onLinkClick }) {
    return (
        <Card
            sx={{
                px: { xs: 1.25, sm: 1.75 },
                py: 1.5,
                height: "100%",
                display: "flex",
                alignItems: "center",
                gap: { xs: 1, sm: 1.5 },
                borderRadius: 3,
                boxShadow: "var(--sl-card-shadow)",
                border: "1px solid var(--sl-border)"
            }}
        >
            <Box
                sx={{
                    width: 42, height: 42, minWidth: 42, borderRadius: "13px",
                    bgcolor: "var(--sl-accent)", color: "var(--sl-ink)",
                    border: "1.5px solid var(--sl-ink)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    "& svg": { fontSize: 21 }
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.5rem", lineHeight: 1.1, color: "var(--sl-ink)" }}>
                    {value}
                </Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.76rem", lineHeight: 1.25, mt: 0.25, overflowWrap: "anywhere" }}>
                    {label}
                </Typography>
                {linkLabel && (
                    <Typography
                        onClick={onLinkClick}
                        sx={{ color: "var(--sl-ink)", fontSize: "0.74rem", fontWeight: 700, cursor: "pointer", mt: 0.25, width: "fit-content", textDecoration: "underline" }}
                    >
                        {linkLabel}
                    </Typography>
                )}
            </Box>
        </Card>
    );
}

function TeacherDashboardPage() {
    const navigate = useNavigate();
    const user = getUser();
    const [teacher, setTeacher] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [totalClasses, setTotalClasses] = useState(0);
    const [totalStudents, setTotalStudents] = useState(0);
    const [pendingDialogPost, setPendingDialogPost] = useState(null);
    const [acknowledgedDialogPost, setAcknowledgedDialogPost] = useState(null);
    const [submissionsDialogPost, setSubmissionsDialogPost] = useState(null);
    const [submissionCounts, setSubmissionCounts] = useState({});
    const [greetings, setGreetings] = useState([]);
    const [bulkReactAnchor, setBulkReactAnchor] = useState(null);
    const [bulkReacting, setBulkReacting] = useState(false);
    const [sharedGreetingsAllowed, setSharedGreetingsAllowed] = useState(false);
    const [savingSharedSetting, setSavingSharedSetting] = useState(false);
    const [selectedGreetingId, setSelectedGreetingId] = useState(null);
    useEffect(() => {
        loadDashboard();
        loadSharedGreetingsSetting();
    }, []);
    async function loadSharedGreetingsSetting() {
        try {
            const response = await getSharedGreetingsSetting();
            if (response.success) {
                setSharedGreetingsAllowed(response.data.allow);
            }
        } catch (err) {
            console.error(err);
        }
    }
    async function handleToggleSharedGreetings(checked) {
        setSavingSharedSetting(true);
        try {
            const response = await setSharedGreetingsSetting(checked);
            if (response.success) {
                setSharedGreetingsAllowed(checked);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setSavingSharedSetting(false);
        }
    }
    async function loadDashboard() {
        try {
            const profileResponse = await getMyTeacherProfile();
            if (!profileResponse.success) {
                setLoading(false);
                return;
            }
            setTeacher(profileResponse.data);
            try {
                const greetingsResponse = await getTodaysGreetingsForClassTeacher();
                if (greetingsResponse.success) {
                    setGreetings(greetingsResponse.data);
                }
            } catch (err) {
                console.error(err);
            }
            const assignmentsResponse = await getMyAssignments(
                profileResponse.data.id
            );
            const assignments = assignmentsResponse.success
                ? assignmentsResponse.data
                : [];
            setTotalClasses(assignments.length);
            const postsWithCounts = [];
            let studentTotal = 0;
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
                    const summary = summaryResponse.success
                        ? summaryResponse.data
                        : null;
                    if (summary) {
                        studentTotal = Math.max(studentTotal, summary.total_students);
                    }
                    postsWithCounts.push({
                        ...hw,
                        class_name: assignment.class_name,
                        section_name: assignment.section_name,
                        subject_name: assignment.subject_name,
                        summary
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
            setTotalStudents(studentTotal);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    const unreactedIds = greetings
        .filter((g) => g.voice_url && !g.teacher_reaction)
        .map((g) => g.id)
        .filter(Boolean);
    async function handleBulkReact(reactionKey) {
        setBulkReactAnchor(null);
        if (unreactedIds.length === 0) {
            return;
        }
        try {
            setBulkReacting(true);
            const response = await bulkReactToGreetings(unreactedIds, reactionKey);
            if (response.success) {
                setGreetings((prev) =>
                    prev.map((g) => {
                        const updated = response.data.find((u) => u.id === g.id);
                        return updated ? { ...g, teacher_reaction: updated.teacher_reaction } : g;
                    })
                );
            }
        } catch (err) {
            console.error(err);
        } finally {
            setBulkReacting(false);
        }
    }
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }
    const postsToday = posts.filter((p) => {
        const dayFormatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: getSchoolTimezone()
        });
        return dayFormatter.format(toUtcDate(p.created_at)) === dayFormatter.format(new Date());
    }).length;
    const totalPending = posts.reduce(
        (sum, p) => sum + (p.summary ? p.summary.pending_count : 0),
        0
    );
    const recentPosts = posts.slice(0, 5);
    const todayLabel = new Intl.DateTimeFormat(undefined, {
        weekday: "short", day: "numeric", month: "short", timeZone: getSchoolTimezone()
    }).format(new Date());

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 1.5,
                    pb: { xs: 1.75, sm: 2.25 },
                    mb: { xs: 2, sm: 2.5 },
                    borderBottom: "1px solid var(--sl-border, #E5E7EB)"
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.9 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "var(--sl-accent, #FFC400)", border: "1.5px solid var(--sl-ink, #111827)" }} />
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.secondary", letterSpacing: 0.2 }} noWrap>
                            {getGreeting()} · {todayLabel}
                        </Typography>
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.45rem", sm: "1.9rem" }, lineHeight: 1.2, mt: 0.4, color: "var(--sl-ink, #111827)" }} noWrap>
                        {getTitledName(teacher, user)} 👋
                    </Typography>
                    {totalPending > 0 ? (
                        <Box
                            role="button"
                            tabIndex={0}
                            onClick={() => navigate("/teacher/posts")}
                            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("/teacher/posts"); } }}
                            sx={{
                                display: "inline-flex", alignItems: "center", gap: 0.75, mt: 0.9, px: 1.25, py: 0.35, whiteSpace: "nowrap",
                                borderRadius: 99, cursor: "pointer", fontSize: "0.8rem", fontWeight: 700,
                                color: "#9A3412", bgcolor: "#FFEDD5", border: "1px solid #FDBA74",
                                "&:hover": { bgcolor: "#FED7AA" }
                            }}
                        >
                            <Box component="span" sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#EA580C" }} />
                            {totalPending}
                            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>&nbsp;acknowledgement{totalPending === 1 ? "" : "s"}</Box>
                            &nbsp;pending
                        </Box>
                    ) : (
                        <Typography sx={{ mt: 0.6, fontSize: "0.85rem", color: "#15803D", fontWeight: 600 }}>
                            ✓ You're all caught up
                        </Typography>
                    )}
                </Box>
                <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => navigate("/teacher/create-post")}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); navigate("/teacher/create-post"); } }}
                    sx={{
                        flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 0.5, cursor: "pointer", userSelect: "none",
                        px: { xs: 1.5, sm: 2.25 }, py: { xs: 0.8, sm: 1 }, borderRadius: 99,
                        fontSize: { xs: "0.85rem", sm: "0.92rem" }, fontWeight: 800,
                        color: "var(--sl-ink, #111827)", bgcolor: "var(--sl-accent, #FFC400)",
                        border: "1.5px solid var(--sl-ink, #111827)", boxShadow: "2px 2px 0 var(--sl-ink, #111827)",
                        "&:hover": { filter: "brightness(0.97)" },
                        "&:active": { transform: "translate(1px, 1px)", boxShadow: "1px 1px 0 var(--sl-ink, #111827)" }
                    }}
                >
                    <AddIcon sx={{ fontSize: 20 }} /> Create Post
                </Box>
            </Box>

            <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}>
                    <KpiCard
                        icon={<MenuBookIcon />}
                        label="Posts Today"
                        value={postsToday}
                        linkLabel="View all posts"
                        onLinkClick={() => navigate("/teacher/posts")}
                    />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <KpiCard
                        icon={<PendingActionsIcon />}
                        label="Not Acknowledged"
                        value={totalPending}
                        linkLabel="View details"
                        onLinkClick={() => navigate("/teacher/posts")}
                    />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <KpiCard icon={<GroupsIcon />} label="Total Students" value={totalStudents} />
                </Grid>
                <Grid size={{ xs: 6, md: 3 }}>
                    <KpiCard icon={<ClassIcon />} label="Classes" value={totalClasses} />
                </Grid>
            </Grid>

            {greetings.length > 0 && (() => {
                const sentCount = greetings.filter((g) => g.voice_url).length;
                const progressPct = Math.round((sentCount / greetings.length) * 100);
                const selectedGreeting = greetings.find(
                    (g) => (g.id || `${g.first_name}-${g.last_name}`) === selectedGreetingId
                );
                return (
                    <Card sx={{ p: { xs: 2, sm: 2.5 }, mb: 3, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--sl-ink)" }}>
                                ☀️ Good Morning Messages
                            </Typography>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                {unreactedIds.length > 0 && (
                                    <Button loading={bulkReacting} loadingPosition="start"
                                        size="small"
                                        variant="outlined"
                                        disabled={bulkReacting}
                                        onClick={(e) => setBulkReactAnchor(e.currentTarget)}
                                    >
                                        {bulkReacting ? "Reacting..." : `React to All (${unreactedIds.length})`}
                                    </Button>
                                )}
                                <Box sx={{ px: 1.25, py: 0.3, borderRadius: 99, bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", fontSize: "0.8rem", fontWeight: 800, color: "var(--sl-ink)" }}>
                                    {sentCount}/{greetings.length} sent
                                </Box>
                            </Box>
                        </Box>

                        <FormControlLabel
                            sx={{ mb: 1.5, ml: 0, gap: 1 }}
                            control={
                                <Switch
                                    checked={sharedGreetingsAllowed}
                                    disabled={savingSharedSetting}
                                    onChange={(e) => handleToggleSharedGreetings(e.target.checked)}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                                    Let parents see each other's Good Morning messages and reactions
                                </Typography>
                            }
                        />

                        <Menu
                            anchorEl={bulkReactAnchor}
                            open={Boolean(bulkReactAnchor)}
                            onClose={() => setBulkReactAnchor(null)}
                        >
                            {reactions.map((r) => (
                                <MenuItem key={r.key} onClick={() => handleBulkReact(r.key)}>
                                    {r.emoji} &nbsp; {r.label}
                                </MenuItem>
                            ))}
                        </Menu>

                        <LinearProgress
                            variant="determinate"
                            value={progressPct}
                            sx={{
                                height: 8, borderRadius: 4, mb: 2.5,
                                bgcolor: "var(--sl-soft2)", border: "1px solid var(--sl-ink)",
                                "& .MuiLinearProgress-bar": { bgcolor: "var(--sl-accent)" }
                            }}
                        />

                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                            {greetings.map((g) => {
                                const key = g.id || `${g.first_name}-${g.last_name}`;
                                const sent = Boolean(g.voice_url);
                                const isSelected = key === selectedGreetingId;
                                return (
                                    <Tooltip
                                        key={key}
                                        title={`${g.first_name} ${g.last_name}${sent ? "" : " - not sent yet"}`}
                                    >
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                            badgeContent={
                                                g.teacher_reaction
                                                    ? reactions.find((r) => r.key === g.teacher_reaction)?.emoji
                                                    : null
                                            }
                                        >
                                            <Avatar
                                                onClick={() => sent && setSelectedGreetingId(isSelected ? null : key)}
                                                sx={{
                                                    width: 46, height: 46, fontSize: "0.85rem", fontWeight: 800,
                                                    cursor: sent ? "pointer" : "default",
                                                    bgcolor: sent ? "var(--sl-accent)" : "transparent",
                                                    color: sent ? "var(--sl-ink)" : "text.disabled",
                                                    border: isSelected
                                                        ? "3px solid var(--sl-ink)"
                                                        : sent
                                                            ? "1.5px solid var(--sl-ink)"
                                                            : "2px dashed var(--sl-border)"
                                                }}
                                            >
                                                {g.first_name[0]}{g.last_name ? g.last_name[0] : ""}
                                            </Avatar>
                                        </Badge>
                                    </Tooltip>
                                );
                            })}
                        </Box>

                        {selectedGreeting && (
                            <Box
                                sx={{
                                    display: "flex", alignItems: "center", justifyContent: "space-between",
                                    flexWrap: "wrap", gap: 1.5, mt: 2.5, p: 1.5, borderRadius: 2.5,
                                    bgcolor: "var(--sl-soft)", border: "1px solid var(--sl-border)"
                                }}
                            >
                                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                                    {selectedGreeting.first_name} {selectedGreeting.last_name}
                                </Typography>
                                <audio controls autoPlay src={resolveFileUrl(selectedGreeting.voice_url)} style={{ height: 32, maxWidth: 220 }} />
                                <GreetingReactionPicker
                                    greeting={selectedGreeting}
                                    onReacted={(updated) => {
                                        setGreetings((prev) =>
                                            prev.map((g) =>
                                                g.id === updated.id ? { ...g, teacher_reaction: updated.teacher_reaction } : g
                                            )
                                        );
                                    }}
                                />
                            </Box>
                        )}
                    </Card>
                );
            })()}

            <Card sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--sl-ink)" }}>
                        Recent Posts
                    </Typography>
                    <Typography
                        onClick={() => navigate("/teacher/posts")}
                        sx={{ color: "var(--sl-ink)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
                    >
                        View All
                    </Typography>
                </Box>

                {recentPosts.length === 0 && (
                    <Box sx={{ textAlign: "center", py: 4 }}>
                        <Typography sx={{ fontWeight: 700, mb: 0.5 }}>No posts yet</Typography>
                        <Typography color="text.secondary" sx={{ fontSize: "0.9rem", mb: 2 }}>
                            Create your first post to get started.
                        </Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate("/teacher/create-post")}>
                            Create Post
                        </Button>
                    </Box>
                )}

                {recentPosts.map((post) => {
                    const total = post.summary ? post.summary.total_students : 0;
                    const acked = post.summary ? post.summary.acknowledged_count : 0;
                    const pend = post.summary ? post.summary.pending_count : 0;
                    const pct = total > 0 ? Math.round((acked / total) * 100) : 0;
                    return (
                        <Box
                            key={post.id}
                            data-testid="recent-post"
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
                                    {post.image_urls && post.image_urls.length > 0 && (
                                        <Box sx={{ display: "flex", gap: 0.75, mt: 1 }}>
                                            {post.image_urls.map((url, i) => (
                                                <Box
                                                    key={i}
                                                    component="img"
                                                    loading="lazy"
                                                    src={resolveFileUrl(url)}
                                                    sx={{ width: 32, height: 32, objectFit: "cover", borderRadius: 1.5, border: "1px solid var(--sl-border)" }}
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
                                        sx={{
                                            height: 7, borderRadius: 4, mb: 1,
                                            bgcolor: "var(--sl-soft2)",
                                            "& .MuiLinearProgress-bar": { bgcolor: "#16A34A" }
                                        }}
                                    />
                                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                                        <Box
                                            onClick={() => acked > 0 && setAcknowledgedDialogPost(post)}
                                            sx={{
                                                px: 1.25, py: 0.35, borderRadius: 99, fontSize: "0.78rem", fontWeight: 700,
                                                color: "#15803D", bgcolor: "#DCFCE7", cursor: acked > 0 ? "pointer" : "default"
                                            }}
                                        >
                                            {acked}/{total} acknowledged
                                        </Box>
                                        <Box
                                            onClick={() => pend > 0 && setPendingDialogPost(post)}
                                            sx={{
                                                px: 1.25, py: 0.35, borderRadius: 99, fontSize: "0.78rem", fontWeight: 700,
                                                color: "#C2410C", bgcolor: "#FFEDD5", cursor: pend > 0 ? "pointer" : "default"
                                            }}
                                        >
                                            {pend} pending
                                        </Box>
                                        <Box
                                            onClick={() => setSubmissionsDialogPost(post)}
                                            sx={{
                                                display: "flex", alignItems: "center", gap: 0.75, px: 1.25, py: 0.35,
                                                borderRadius: 99, fontSize: "0.78rem", fontWeight: 700, cursor: "pointer",
                                                border: "1.5px solid var(--sl-ink)", color: "var(--sl-ink)"
                                            }}
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
export default TeacherDashboardPage;
