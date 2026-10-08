import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
    Box,
    Chip,
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
        <Box sx={{ maxWidth: 820 }}>

            <Box
                onClick={() => navigate("/parent/dashboard")}
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "#475569",
                    cursor: "pointer",
                    mb: 1.5,
                    px: 1.25,
                    py: 0.5,
                    borderRadius: 5,
                    bgcolor: "#F1F5F9",
                    "&:hover": { bgcolor: "#E2E8F0" }
                }}
            >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                    Dashboard
                </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.4rem", md: "1.7rem" }, lineHeight: 1.2 }}>
                    All Updates
                </Typography>
                {selectedChild && (
                    <Typography sx={{ color: "#64748B", fontSize: "0.88rem" }}>
                        {selectedChild.first_name} {selectedChild.last_name} · {selectedChild.class_name} - {selectedChild.section_name}
                    </Typography>
                )}
            </Box>

            <TextField
                fullWidth
                size="small"
                placeholder="Search updates by title"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    )
                }}
                sx={{
                    mb: 1.5,
                    "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "#FFFFFF"
                    }
                }}
            />

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2.5 }}>
                {filters.map((f) => {
                    const active = postFilter === f.value;

                    return (
                        <Chip
                            key={f.value}
                            clickable
                            onClick={() => setPostFilter(f.value)}
                            label={`${f.label} · ${f.count}`}
                            sx={{
                                fontWeight: 600,
                                fontSize: "0.82rem",
                                height: 32,
                                bgcolor: active ? "#2563EB" : "#FFFFFF",
                                color: active ? "#FFFFFF" : "#475569",
                                border: active ? "1px solid #2563EB" : "1px solid #E2E8F0",
                                "&:hover": { bgcolor: active ? "#1D4ED8" : "#F8FAFC" }
                            }}
                        />
                    );
                })}
            </Box>

            {filteredPosts.length === 0 && (
                <Box
                    sx={{
                        py: 6,
                        textAlign: "center",
                        color: "#94A3B8",
                        bgcolor: "#FFFFFF",
                        border: "1px solid #EEF2F7",
                        borderRadius: 3
                    }}
                >
                    <MenuBookIcon sx={{ fontSize: 36, mb: 0.5 }} />
                    <Typography sx={{ fontSize: "0.9rem" }}>
                        No updates found.
                    </Typography>
                </Box>
            )}

            {groups.map((group) => (
                <Box key={group.label} sx={{ mb: 2.5 }}>

                    <Typography
                        sx={{
                            color: "#64748B",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                            mb: 1,
                            px: 0.5
                        }}
                    >
                        {group.label}
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

                        {group.items.map((post) => {
                            const isAnnouncement = post.post_type === "announcement";

                            const statusLabel = post.is_acknowledged
                                ? "Acknowledged"
                                : post.require_acknowledgement === false
                                    ? "No action needed"
                                    : "Pending";

                            const statusStyle = post.is_acknowledged
                                ? { bgcolor: "#DCFCE7", color: "#15803D" }
                                : post.require_acknowledgement === false
                                    ? { bgcolor: "#F1F5F9", color: "#64748B" }
                                    : { bgcolor: "#FFEDD5", color: "#C2410C" };

                            return (
                                <Box
                                    key={`${post.post_type}-${post.id}`}
                                    onClick={() => navigate(
                                        `/parent/post/${post.post_type}/${post.id}/${selectedStudentId}`,
                                        { state: { post, student: selectedChild } }
                                    )}
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        px: { xs: 1.5, md: 2 },
                                        py: 1.5,
                                        bgcolor: "#FFFFFF",
                                        border: "1px solid #EEF2F7",
                                        borderRadius: 3,
                                        boxShadow: "0 1px 3px rgba(15,23,42,.05)",
                                        cursor: "pointer",
                                        transition: ".15s",
                                        "&:hover": {
                                            boxShadow: "0 4px 12px rgba(15,23,42,.08)",
                                            borderColor: "#DBEAFE"
                                        }
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            minWidth: 40,
                                            borderRadius: "10px",
                                            bgcolor: isAnnouncement ? "#EDE9FE" : "#DBEAFE",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}
                                    >
                                        {isAnnouncement
                                            ? <CampaignIcon sx={{ color: "#7C3AED", fontSize: 21 }} />
                                            : <MenuBookIcon sx={{ color: "#2563EB", fontSize: 21 }} />}
                                    </Box>

                                    <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Typography
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: "0.92rem",
                                                lineHeight: 1.3,
                                                display: "-webkit-box",
                                                WebkitLineClamp: 2,
                                                WebkitBoxOrient: "vertical",
                                                overflow: "hidden"
                                            }}
                                        >
                                            {post.title}
                                        </Typography>

                                        <Typography
                                            sx={{
                                                color: "#64748B",
                                                fontSize: "0.78rem",
                                                mt: 0.25,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            }}
                                        >
                                            {isAnnouncement
                                                ? `Announcement · ${post.target_audience}`
                                                : `${post.teacher_first_name} ${post.teacher_last_name} · ${post.subject_name}`}
                                        </Typography>
                                    </Box>

                                    <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                                        <Chip
                                            size="small"
                                            label={statusLabel}
                                            sx={{
                                                height: 22,
                                                fontSize: "0.72rem",
                                                fontWeight: 600,
                                                ...statusStyle
                                            }}
                                        />
                                        <Typography sx={{ color: "#94A3B8", fontSize: "0.7rem", mt: 0.5 }}>
                                            {formatPostTime(post.created_at)}
                                        </Typography>
                                    </Box>

                                    <ChevronRightIcon
                                        sx={{ color: "#CBD5E1", fontSize: 20, display: { xs: "none", sm: "block" } }}
                                    />
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
