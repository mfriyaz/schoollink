import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    CircularProgress,
    Grid,
    LinearProgress,
    Menu,
    MenuItem,
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

import { getTodaysGreetingsForClassTeacher, bulkReactToGreetings } from "../../services/morningGreetingService";

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

function KpiCard({ icon, iconBg, label, value, linkLabel, onLinkClick }) {

    return (

        <Card

            sx={{

                p: 2.5,

                height: "100%",

                display: "flex",

                flexDirection: "column",

                gap: 1.5

            }}

        >

            <Box

                sx={{

                    width: 44,

                    height: 44,

                    borderRadius: "12px",

                    bgcolor: iconBg,

                    display: "flex",

                    alignItems: "center",

                    justifyContent: "center"

                }}

            >

                {icon}

            </Box>

            <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>

                {label}

            </Typography>

            <Typography sx={{ fontWeight: 700, fontSize: "1.9rem", lineHeight: 1 }}>

                {value}

            </Typography>

            {linkLabel && (

                <Typography

                    onClick={onLinkClick}

                    sx={{

                        color: "#2563EB",

                        fontSize: "0.82rem",

                        fontWeight: 600,

                        cursor: "pointer",

                        mt: 0.5

                    }}

                >

                    {linkLabel}

                </Typography>

            )}

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

    const [selectedGreetingId, setSelectedGreetingId] = useState(null);

    useEffect(() => {

        loadDashboard();

    }, []);

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

    return (

        <Box>

            <Box

                sx={{

                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "flex-start",

                    mb: 3

                }}

            >

                <Box>

                    <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>

                        {getGreeting()},

                    </Typography>

                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.3 }}>

                        {getTitledName(teacher, user)} 👋

                    </Typography>

                    <Typography sx={{ color: "#64748B", mt: 0.5 }}>

                        Here's what's happening today.

                    </Typography>

                </Box>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => navigate("/teacher/create-post")}
                >

                    Create Post

                </Button>

            </Box>

            <Grid container spacing={3} sx={{ mb: 4 }}>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>

                    <KpiCard
                        icon={<MenuBookIcon sx={{ color: "#2563EB" }} />}
                        iconBg="#DBEAFE"
                        label="Posts Today"
                        value={postsToday}
                        linkLabel="View all posts"
                        onLinkClick={() => navigate("/teacher/posts")}
                    />

                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>

                    <KpiCard
                        icon={<PendingActionsIcon sx={{ color: "#EA580C" }} />}
                        iconBg="#FFEDD5"
                        label="Pending Acknowledgements"
                        value={totalPending}
                        linkLabel="View details"
                        onLinkClick={() => navigate("/teacher/posts")}
                    />

                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>

                    <KpiCard
                        icon={<GroupsIcon sx={{ color: "#16A34A" }} />}
                        iconBg="#DCFCE7"
                        label="Total Students"
                        value={totalStudents}
                    />

                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>

                    <KpiCard
                        icon={<ClassIcon sx={{ color: "#D97706" }} />}
                        iconBg="#FEF3C7"
                        label="Classes"
                        value={totalClasses}
                    />

                </Grid>

            </Grid>

            {greetings.length > 0 && (() => {

                const sentCount = greetings.filter((g) => g.voice_url).length;

                const progressPct = Math.round((sentCount / greetings.length) * 100);

                const selectedGreeting = greetings.find(

                    (g) => (g.id || `${g.first_name}-${g.last_name}`) === selectedGreetingId

                );

                return (

                    <Card sx={{ p: 3, mb: 3 }}>

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>

                            <Typography variant="h6" sx={{ fontWeight: 700 }}>

                                ☀️ Good Morning Messages

                            </Typography>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

                                {unreactedIds.length > 0 && (

                                    <Button

                                        size="small"

                                        variant="outlined"

                                        disabled={bulkReacting}

                                        onClick={(e) => setBulkReactAnchor(e.currentTarget)}

                                    >

                                        {bulkReacting ? "Reacting..." : `React to All (${unreactedIds.length})`}

                                    </Button>

                                )}

                                <Typography sx={{ color: "#64748B", fontSize: "0.85rem", fontWeight: 600 }}>

                                    {sentCount}/{greetings.length} sent

                                </Typography>

                            </Box>

                        </Box>

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

                                height: 6,

                                borderRadius: 3,

                                mb: 2.5,

                                bgcolor: "#F1F5F9",

                                "& .MuiLinearProgress-bar": { bgcolor: "#16A34A" }

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

                                                    width: 44,

                                                    height: 44,

                                                    fontSize: "0.85rem",

                                                    fontWeight: 700,

                                                    cursor: sent ? "pointer" : "default",

                                                    bgcolor: sent ? "#DCFCE7" : "#F1F5F9",

                                                    color: sent ? "#16A34A" : "#CBD5E1",

                                                    border: isSelected

                                                        ? "3px solid #16A34A"

                                                        : sent

                                                            ? "2px solid #86EFAC"

                                                            : "2px dashed #E2E8F0"

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

                                    display: "flex",

                                    alignItems: "center",

                                    justifyContent: "space-between",

                                    flexWrap: "wrap",

                                    gap: 1.5,

                                    mt: 2.5,

                                    p: 1.5,

                                    borderRadius: 2,

                                    bgcolor: "#F8FAFC"

                                }}

                            >

                                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>

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

            <Card sx={{ p: 3 }}>

                <Box

                    sx={{

                        display: "flex",

                        justifyContent: "space-between",

                        alignItems: "center",

                        mb: 2

                    }}

                >

                    <Typography variant="h6" sx={{ fontWeight: 700 }}>

                        Recent Posts

                    </Typography>

                    <Typography

                        onClick={() => navigate("/teacher/posts")}

                        sx={{

                            color: "#2563EB",

                            fontWeight: 600,

                            fontSize: "0.85rem",

                            cursor: "pointer"

                        }}

                    >

                        View All

                    </Typography>

                </Box>

                {recentPosts.length === 0 && (

                    <Typography color="text.secondary">

                        No posts yet. Create your first post to get started.

                    </Typography>

                )}

                {recentPosts.map((post) => (

                    <Box

                        key={post.id}

                        sx={{

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "space-between",

                            flexWrap: "wrap",

                            gap: 1.5,

                            py: 2,

                            borderBottom: "1px solid #F1F5F9",

                            "&:last-child": {

                                borderBottom: "none"

                            }

                        }}

                    >

                        <Box

                            onClick={() => navigate(`/teacher/posts/${post.id}`)}

                            sx={{ display: "flex", alignItems: "center", gap: 2, cursor: "pointer", minWidth: 0, flex: "1 1 220px" }}
                        >

                            <Box

                                sx={{

                                    width: 40,

                                    height: 40,

                                    borderRadius: "10px",

                                    bgcolor: "#DBEAFE",

                                    display: "flex",

                                    alignItems: "center",

                                    justifyContent: "center",

                                    flexShrink: 0

                                }}

                            >

                                <MenuBookIcon sx={{ color: "#2563EB", fontSize: 20 }} />

                            </Box>

                            <Box sx={{ minWidth: 0 }}>

                                <Typography sx={{ fontWeight: 600, wordBreak: "break-word" }}>

                                    {post.title}

                                </Typography>

                                <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>

                                    {post.class_name} - {post.section_name} · {post.subject_name}

                                </Typography>

                                {post.image_urls && post.image_urls.length > 0 && (

                                    <Box sx={{ display: "flex", gap: 0.75, mt: 1 }}>

                                        {post.image_urls.map((url, i) => (

                                            <Box

                                                key={i}

                                                component="img"

                                                loading="lazy"

                                                src={resolveFileUrl(url)}

                                                sx={{

                                                    width: 32,

                                                    height: 32,

                                                    objectFit: "cover",

                                                    borderRadius: 1.5,

                                                    border: "1px solid #E2E8F0"

                                                }}

                                            />

                                        ))}

                                    </Box>

                                )}

                            </Box>

                        </Box>

                        {post.summary && (

                            <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 2.5, sm: 4 }, flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>

                                <Box

                                    sx={{

                                        textAlign: "center",

                                        cursor: post.summary.acknowledged_count > 0 ? "pointer" : "default"

                                    }}

                                    onClick={() => {

                                        if (post.summary.acknowledged_count > 0) {

                                            setAcknowledgedDialogPost(post);

                                        }

                                    }}

                                >

                                    <Typography sx={{ color: "#16A34A", fontWeight: 700, textDecoration: post.summary.acknowledged_count > 0 ? "underline" : "none" }}>

                                        {post.summary.acknowledged_count}/{post.summary.total_students}

                                    </Typography>

                                    <Typography sx={{ color: "#16A34A", fontSize: "0.75rem", fontWeight: 600 }}>

                                        Acknowledged

                                    </Typography>

                                </Box>

                                <Box

                                    sx={{

                                        textAlign: "center",

                                        cursor: post.summary.pending_count > 0 ? "pointer" : "default"

                                    }}

                                    onClick={() => {

                                        if (post.summary.pending_count > 0) {

                                            setPendingDialogPost(post);

                                        }

                                    }}

                                >

                                    <Typography sx={{ color: "#EA580C", fontWeight: 700, textDecoration: post.summary.pending_count > 0 ? "underline" : "none" }}>

                                        {post.summary.pending_count}

                                    </Typography>

                                    <Typography sx={{ color: "#EA580C", fontSize: "0.75rem", fontWeight: 600 }}>

                                        Pending

                                    </Typography>

                                </Box>

                                <Typography

                                    sx={{

                                        color: "#94A3B8",

                                        fontSize: "0.8rem",

                                        minWidth: 100,

                                        textAlign: "right"

                                    }}

                                >

                                    {formatPostTime(post.created_at)}

                                </Typography>

                                <Box

                                    onClick={() => setSubmissionsDialogPost(post)}

                                    sx={{

                                        display: "flex",

                                        alignItems: "center",

                                        gap: 0.75,

                                        cursor: "pointer",

                                        minWidth: 110,

                                        justifyContent: "flex-end"

                                    }}

                                >

                                    <Badge
                                        badgeContent={submissionCounts[post.id] || 0}
                                        color="error"
                                        overlap="circular"
                                    >

                                        <PhotoCameraIcon sx={{ color: "#7C3AED", fontSize: 20 }} />

                                    </Badge>

                                    <Typography

                                        sx={{

                                            color: "#7C3AED",

                                            fontSize: "0.78rem",

                                            fontWeight: 600

                                        }}

                                    >

                                        Submissions

                                    </Typography>

                                </Box>

                            </Box>

                        )}

                    </Box>

                ))}

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
