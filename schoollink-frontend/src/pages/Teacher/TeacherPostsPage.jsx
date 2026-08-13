import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Badge,
    Box,
    Card,
    CircularProgress,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import PhotoCameraIcon from "@mui/icons-material/PhotoCameraOutlined";

import {
    getMyTeacherProfile,
    getMyAssignments,
    getHomeworkByAssignment,
    getHomeworkAckSummary
} from "../../services/postService";

import PendingStudentsDialog from "../../components/Teacher/PendingStudentsDialog";
import SubmissionsDialog from "../../components/Teacher/SubmissionsDialog";

import { getSubmissionCount } from "../../services/homeworkSubmissionService";

import { formatPostTime, toUtcDate } from "../../utils/dateUtils";

import { resolveFileUrl } from "../../config";

function TeacherPostsPage() {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);

    const [posts, setPosts] = useState([]);

    const [pendingDialogPost, setPendingDialogPost] = useState(null);

    const [submissionsDialogPost, setSubmissionsDialogPost] = useState(null);

    const [submissionCounts, setSubmissionCounts] = useState({});

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

    return (

        <Box sx={{ maxWidth: 800 }}>

            <Box
                onClick={() => navigate("/teacher/dashboard")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", cursor: "pointer", mb: 2, width: "fit-content" }}
            >

                <ArrowBackIcon fontSize="small" />

                <Typography sx={{ fontSize: "0.9rem" }}>Back to Dashboard</Typography>

            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 3 }}>

                All My Posts

            </Typography>

            <Card sx={{ p: 3 }}>

                {loading && (

                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>

                        <CircularProgress size={28} />

                    </Box>

                )}

                {!loading && posts.length === 0 && (

                    <Typography color="text.secondary">

                        No posts yet.

                    </Typography>

                )}

                {!loading && posts.map((post) => (

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

                            "&:last-child": { borderBottom: "none" }

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

                                                    width: 36,

                                                    height: 36,

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

                                <Box sx={{ textAlign: "center" }}>

                                    <Typography sx={{ color: "#16A34A", fontWeight: 700 }}>

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

        </Box>

    );

}

export default TeacherPostsPage;
