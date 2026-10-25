import ChildHeader from "../../components/Parent/ChildHeader";
import QuizTag from "../../components/common/QuizTag";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Avatar,
    Badge,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    MenuItem,
    Tab,
    Tabs,
    TextField,
    Tooltip,
    Typography
} from "@mui/material";
import { getCalendar } from "../../services/calendarService";
import { dayInfo } from "../../utils/calendarUtils";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelIcon from "@mui/icons-material/CancelOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTimeOutlined";
import MicIcon from "@mui/icons-material/MicOutlined";
import StopCircleIcon from "@mui/icons-material/StopCircleOutlined";
import {
    getMyChildren,
    getHomeworkForStudent,
    getAnnouncementsForStudent,
    getAttendanceForStudent,
    uploadAttachment
} from "../../services/postService";
import {
    submitGreeting,
    getTodaysGreeting,
    getClassmatesGreetingsToday
} from "../../services/morningGreetingService";
import { toUtcDate, formatPostTime, getSchoolTimezone } from "../../utils/dateUtils";
import { resolveFileUrl } from "../../config";
const panelSx = {
    p: { xs: 2, md: 2.5 },
    borderRadius: 3,
    border: "1px solid var(--sl-border)",
    boxShadow: "var(--sl-card-shadow)"
};

const pillSx = (active) => ({
    px: 1.5,
    py: 0.55,
    borderRadius: 99,
    cursor: "pointer",
    userSelect: "none",
    fontSize: "0.82rem",
    fontWeight: 700,
    display: "flex",
    alignItems: "center",
    gap: 0.75,
    border: "1.5px solid var(--sl-ink)",
    bgcolor: active ? "var(--sl-accent)" : "transparent",
    color: "var(--sl-ink)",
    "&:hover": { bgcolor: active ? undefined : "var(--sl-soft)" }
});
const reactionEmojis = {
    good: "👍",
    nice: "⭐",
    great: "🎉",
    good_job: "💯"
};
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
function ParentDashboardPage() {
    const navigate = useNavigate();
    const user = getUser();
    const [loading, setLoading] = useState(true);
    const [children, setChildren] = useState([]);
    const [selectedStudentId, setSelectedStudentId] = useState("");
    const [posts, setPosts] = useState([]);
    const [attendance, setAttendance] = useState([]);
    const [calendar, setCalendar] = useState(null);
    const [postFilter, setPostFilter] = useState("all");
    const [attendanceTab, setAttendanceTab] = useState("today");
    const [todaysGreeting, setTodaysGreeting] = useState(null);
    const [classmatesGreetings, setClassmatesGreetings] = useState([]);
    const [classmatesSharingEnabled, setClassmatesSharingEnabled] = useState(true);
    const [selectedClassmateId, setSelectedClassmateId] = useState(null);
    const [isRecordingGreeting, setIsRecordingGreeting] = useState(false);
    const [greetingSeconds, setGreetingSeconds] = useState(0);
    const [sendingGreeting, setSendingGreeting] = useState(false);
    const [greetingError, setGreetingError] = useState("");
    const [previewAudioUrl, setPreviewAudioUrl] = useState(null);
    const [previewAudioBlob, setPreviewAudioBlob] = useState(null);
    useEffect(() => {
        loadChildren();
        loadCalendar();
    }, []);
    async function loadChildren() {
        try {
            const response = await getMyChildren();
            if (response.success && response.data.length > 0) {
                setChildren(response.data);
                setSelectedStudentId(response.data[0].student_id);
                await loadPosts(response.data[0].student_id);
                await loadAttendance(response.data[0].student_id);
                await loadTodaysGreeting(response.data[0].student_id);
                await loadClassmatesGreetings(response.data[0].student_id);
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
            const homeworkPosts = homeworkResponse.success
                ? homeworkResponse.data.map((p) => ({ ...p, post_type: "homework" }))
                : [];
            const announcementPosts = announcementResponse.success
                ? announcementResponse.data.map((p) => ({ ...p, post_type: "announcement" }))
                : [];
            const merged = [...homeworkPosts, ...announcementPosts].sort(
                (a, b) => toUtcDate(b.created_at) - toUtcDate(a.created_at)
            );
            setPosts(merged);
        } catch (err) {
            console.error(err);
        }
    }
    async function loadCalendar() {
        try {
            const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: getSchoolTimezone() });
            const today = dayFmt.format(new Date());
            const monthStart = `${today.slice(0, 7)}-01`;
            const end = new Date();
            end.setDate(end.getDate() + 120);
            const response = await getCalendar(monthStart, dayFmt.format(end));
            if (response.success) {
                setCalendar(response.data);
            }
        } catch (err) {
            console.error(err);
        }
    }
    async function loadAttendance(studentId) {
        try {
            const response = await getAttendanceForStudent(studentId);
            if (response.success) {
                setAttendance(response.data.slice(0, 30));
            }
        } catch (err) {
            console.error(err);
        }
    }
    async function loadTodaysGreeting(studentId) {
        try {
            const response = await getTodaysGreeting(studentId);
            if (response.success) {
                setTodaysGreeting(response.data);
            }
        } catch (err) {
            console.error(err);
        }
    }
    async function loadClassmatesGreetings(studentId) {
        try {
            const response = await getClassmatesGreetingsToday(studentId);
            if (response.success) {
                setClassmatesGreetings(response.data);
                setClassmatesSharingEnabled(true);
            }
        } catch (err) {
            // The class teacher simply hasn't turned this on for
            // their class yet - a normal, expected state, not an
            // error worth showing the parent.
            setClassmatesGreetings([]);
            setClassmatesSharingEnabled(false);
        }
    }
    const greetingRecorderRef = useRef(null);
    const greetingChunksRef = useRef([]);
    const greetingTimerRef = useRef(null);
    // Chrome/Android record in webm; Safari on iPhone doesn't
    // support webm at all and records in mp4 instead. Hardcoding
    // "audio/webm" regardless of what was actually recorded
    // causes playback to fail with an error on iPhone - this
    // picks whatever format the browser actually supports.
    function getSupportedAudioMimeType() {
        if (MediaRecorder.isTypeSupported("audio/webm")) {
            return "audio/webm";
        }
        if (MediaRecorder.isTypeSupported("audio/mp4")) {
            return "audio/mp4";
        }
        return "";
    }
    async function handleStartGreetingRecording() {
        setGreetingError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mimeType = getSupportedAudioMimeType();
            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
            greetingChunksRef.current = [];
            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    greetingChunksRef.current.push(e.data);
                }
            };
            recorder.onstop = () => {
                stream.getTracks().forEach((track) => track.stop());
                clearInterval(greetingTimerRef.current);
                // Use the recorder's actual mimeType, not a
                // hardcoded guess - this is what fixes playback.
                const actualType = recorder.mimeType || "audio/webm";
                const audioBlob = new Blob(greetingChunksRef.current, { type: actualType });
                setPreviewAudioBlob(audioBlob);
                setPreviewAudioUrl(URL.createObjectURL(audioBlob));
            };
            greetingRecorderRef.current = recorder;
            recorder.start();
            setIsRecordingGreeting(true);
            setGreetingSeconds(0);
            greetingTimerRef.current = setInterval(() => {
                setGreetingSeconds((s) => s + 1);
            }, 1000);
        } catch (err) {
            setGreetingError(
                "Couldn't access your microphone. Please allow microphone access and try again."
            );
        }
    }
    function handleStopGreetingRecording() {
        if (greetingRecorderRef.current) {
            greetingRecorderRef.current.stop();
        }
        setIsRecordingGreeting(false);
    }
    function handleReRecordGreeting() {
        if (previewAudioUrl) {
            URL.revokeObjectURL(previewAudioUrl);
        }
        setPreviewAudioBlob(null);
        setPreviewAudioUrl(null);
        setGreetingError("");
    }
    async function handleConfirmSendGreeting() {
        setGreetingError("");
        if (!previewAudioBlob) {
            return;
        }
        try {
            setSendingGreeting(true);
            const fileExtension = previewAudioBlob.type.includes("mp4") ? "mp4" : "webm";
            const audioFile = new File(
                [previewAudioBlob],
                `greeting-${Date.now()}.${fileExtension}`,
                { type: previewAudioBlob.type || "audio/webm" }
            );
            const uploadResponse = await uploadAttachment(audioFile);
            if (uploadResponse.success) {
                const submitResponse = await submitGreeting(
                    selectedStudentId,
                    uploadResponse.data.url
                );
                if (submitResponse.success) {
                    setTodaysGreeting(submitResponse.data);
                    URL.revokeObjectURL(previewAudioUrl);
                    setPreviewAudioBlob(null);
                    setPreviewAudioUrl(null);
                } else {
                    setGreetingError(submitResponse.message);
                }
            } else {
                setGreetingError(uploadResponse.message);
            }
        } catch (err) {
            setGreetingError(
                err.response?.data?.message ||
                "Unable to send your Good Morning message."
            );
        } finally {
            setSendingGreeting(false);
        }
    }
    async function handleChildChange(studentId) {
        setSelectedStudentId(studentId);
        setLoading(true);
        await loadPosts(studentId);
        await loadAttendance(studentId);
        await loadTodaysGreeting(studentId);
        setSelectedClassmateId(null);
        await loadClassmatesGreetings(studentId);
        setLoading(false);
    }
    const selectedChild = children.find(
        (c) => c.student_id === selectedStudentId
    );
    function isToday(dateString) {
        const dayFormatter = new Intl.DateTimeFormat("en-CA", {
            timeZone: getSchoolTimezone()
        });
        return dayFormatter.format(toUtcDate(dateString)) === dayFormatter.format(new Date());
    }
    const todaysPosts = posts.filter((p) => isToday(p.created_at));
    const filteredPosts = postFilter === "all"
        ? todaysPosts
        : todaysPosts.filter((p) => p.post_type === postFilter);
    const displayedPosts = filteredPosts;
    // Posts that actually need action - excludes ones a teacher
    // marked as not requiring acknowledgement.
    const actionablePosts = posts.filter((p) => p.require_acknowledgement !== false);
    const pendingCount = actionablePosts.filter((p) => !p.is_acknowledged).length;
    const acknowledgedCount = actionablePosts.filter((p) => p.is_acknowledged).length;
    if (loading && children.length === 0) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }
    if (children.length === 0) {
        return (
            <Typography color="text.secondary">
                No children are linked to your account yet.
                Please contact your school.
            </Typography>
        );
    }
    const selectedClassmate = classmatesGreetings.find(
        (g) => g.student_id === selectedClassmateId
    );
    return (
        <Box>
            {/* ---------- Child header ---------- */}
            <ChildHeader
                child={selectedChild}
                kids={children}
                selectedId={selectedStudentId}
                onSelect={handleChildChange}
                eyebrow={`${getGreeting()}, ${user ? user.full_name : "Parent"} 🤝`}
            />
            {/* ---------- At-a-glance tiles ---------- */}
            {(() => {
                const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: getSchoolTimezone() });
                const todayStr = dayFmt.format(new Date());
                const todayAtt = attendance.find(
                    (r) => dayFmt.format(toUtcDate(r.attendance_date)) === todayStr
                );
                const offToday = !todayAtt ? dayInfo(todayStr, calendar) : { off: false };
                const attStatus = todayAtt
                    ? todayAtt.status
                    : offToday.off
                        ? (offToday.reason === "Holiday" ? "Holiday" : offToday.reason)
                        : "Not marked";
                const attColor =
                    !todayAtt && offToday.off
                        ? (offToday.reason === "Holiday" ? { fg: "#6D28D9", bg: "#EDE9FE" } : { fg: "#475569", bg: "#E2E8F0" }) :
                    !todayAtt ? { fg: "#64748B", bg: "#F1F5F9" } :
                    todayAtt.status === "Present" ? { fg: "#16A34A", bg: "#DCFCE7" } :
                    todayAtt.status === "Late" ? { fg: "#EA580C", bg: "#FFEDD5" } :
                    { fg: "#DC2626", bg: "#FEE2E2" };
                const tiles = [
                    {
                        label: "Today's attendance",
                        value: attStatus,
                        fg: attColor.fg,
                        bg: attColor.bg,
                        icon: <CheckCircleIcon />,
                        small: true
                    },
                    {
                        label: "Waiting for response",
                        value: pendingCount,
                        fg: "#EA580C",
                        bg: "#FFEDD5",
                        icon: <AccessTimeIcon />,
                        onClick: () => navigate("/parent/all-updates", { state: { studentId: selectedStudentId } })
                    },
                    {
                        label: "Acknowledged",
                        value: `${acknowledgedCount}/${actionablePosts.length}`,
                        fg: "#16A34A",
                        bg: "#DCFCE7",
                        icon: <CheckCircleIcon />
                    },
                    {
                        label: "Updates today",
                        value: todaysPosts.length,
                        fg: "var(--sl-primary)",
                        bg: "var(--sl-soft)",
                        icon: <MenuBookIcon />
                    }
                ];
                return (
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
                            gap: { xs: 1, md: 1.5 },
                            mb: 2.5
                        }}
                    >
                        {tiles.map((t) => (
                            <Card
                                key={t.label}
                                onClick={t.onClick}
                                sx={{
                                    px: { xs: 1.25, md: 1.5 },
                                    py: { xs: 1, md: 1.25 },
                                    display: "flex",
                                    alignItems: "center",
                                    gap: { xs: 1, md: 1.25 },
                                    borderRadius: 3,
                                    border: "1px solid var(--sl-border)",
                                    boxShadow: "var(--sl-card-shadow)",
                                    cursor: t.onClick ? "pointer" : "default",
                                    "&:active": t.onClick ? { transform: "translateY(1px)" } : {}
                                }}
                            >
                                <Box
                                    sx={{
                                        width: { xs: 32, md: 36 },
                                        height: { xs: 32, md: 36 },
                                        minWidth: { xs: 32, md: 36 },
                                        borderRadius: "11px",
                                        bgcolor: "var(--sl-accent)",
                                        color: "var(--sl-ink)",
                                        border: "1.5px solid var(--sl-ink)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        "& svg": { fontSize: 19 }
                                    }}
                                >
                                    {t.icon}
                                </Box>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography
                                        sx={{
                                            fontWeight: 800,
                                            fontSize: t.small ? { xs: "0.85rem", md: "0.95rem" } : { xs: "1.1rem", md: "1.25rem" },
                                            lineHeight: 1.15,
                                            color: t.small ? t.fg : "var(--sl-ink)"
                                        }}
                                        noWrap
                                    >
                                        {t.value}
                                    </Typography>
                                    <Typography sx={{ color: "#64748B", fontSize: "0.7rem", lineHeight: 1.25, mt: 0.25 }}>
                                        {t.label}
                                    </Typography>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                );
            })()}
            <Card sx={{ ...panelSx, mb: 2.5, bgcolor: todaysGreeting ? "#F0FDF4" : "var(--sl-soft)", border: todaysGreeting ? "1.5px solid #16A34A" : "1.5px solid var(--sl-ink)" }}>
                {greetingError && <Alert severity="error" sx={{ mb: 2 }}>{greetingError}</Alert>}
                {todaysGreeting ? (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                        <Box>
                            <Typography sx={{ fontWeight: 700, color: "#166534" }}>
                                ☀️ Good Morning sent to your class teacher!
                            </Typography>
                            <Typography sx={{ color: "#64748B", fontSize: "0.82rem", mt: 0.3 }}>
                                Sent at {toUtcDate(todaysGreeting.created_at).toLocaleTimeString(undefined, { timeZone: getSchoolTimezone() })}
                            </Typography>
                            {todaysGreeting.teacher_reaction && (
                                <Typography sx={{ color: "#166534", fontSize: "0.85rem", fontWeight: 600, mt: 0.5 }}>
                                    Teacher reacted: {reactionEmojis[todaysGreeting.teacher_reaction] || ""}
                                </Typography>
                            )}
                        </Box>
                        <audio controls src={resolveFileUrl(todaysGreeting.voice_url)} style={{ height: 36 }} />
                    </Box>
                ) : previewAudioUrl ? (
                    <Box>
                        <Typography sx={{ fontWeight: 700, mb: 1.5 }}>
                            🎧 Listen back before sending
                        </Typography>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                            <audio controls src={previewAudioUrl} style={{ height: 36 }} />
                            <Box sx={{ display: "flex", gap: 1.5 }}>
                                <Button
                                    variant="outlined"
                                    onClick={handleReRecordGreeting}
                                    disabled={sendingGreeting}
                                >
                                    Re-record
                                </Button>
                                <Button loading={sendingGreeting} loadingPosition="start"
                                    variant="contained"
                                    color="success"
                                    onClick={handleConfirmSendGreeting}
                                    disabled={sendingGreeting}
                                >
                                    {sendingGreeting ? "Sending..." : "Confirm & Send"}
                                </Button>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                        <Box>
                            <Typography sx={{ fontWeight: 700 }}>
                                ☀️ Say Good Morning to your class teacher!
                            </Typography>
                            <Typography sx={{ color: "#64748B", fontSize: "0.82rem", mt: 0.3 }}>
                                Record a quick wake-up voice message for today
                            </Typography>
                        </Box>
                        {isRecordingGreeting ? (
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<StopCircleIcon />}
                                onClick={handleStopGreetingRecording}
                            >
                                Recording... {Math.floor(greetingSeconds / 60)}:{String(greetingSeconds % 60).padStart(2, "0")} (tap to stop)
                            </Button>
                        ) : (
                            <Button
                                variant="contained"
                                startIcon={sendingGreeting ? <CircularProgress size={16} color="inherit" /> : <MicIcon />}
                                onClick={handleStartGreetingRecording}
                                disabled={sendingGreeting}
                            >
                                {sendingGreeting ? "Sending..." : "Record Good Morning"}
                            </Button>
                        )}
                    </Box>
                )}
            </Card>
            {classmatesSharingEnabled && classmatesGreetings.filter((g) => g.student_id !== selectedStudentId).length > 0 && (
                <Card sx={{ ...panelSx, mb: 2.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", mb: 0.5, color: "var(--sl-ink)" }}>
                        👋 Classmates' Good Morning Messages
                    </Typography>
                    <Typography sx={{ color: "#64748B", fontSize: "0.82rem", mb: 2 }}>
                        Tap a classmate to listen. Your class teacher has turned on sharing for the class today.
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: selectedClassmate ? 2 : 0 }}>
                        {classmatesGreetings
                            .filter((g) => g.student_id !== selectedStudentId)
                            .map((g) => {
                                const isSelected = selectedClassmateId === g.student_id;
                                return (
                                    <Tooltip key={g.student_id} title={`${g.first_name} ${g.last_name}`}>
                                        <Badge
                                            overlap="circular"
                                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                            badgeContent={g.teacher_reaction ? reactionEmojis[g.teacher_reaction] : null}
                                        >
                                            <Avatar
                                                onClick={() => setSelectedClassmateId(isSelected ? null : g.student_id)}
                                                sx={{
                                                    width: 46,
                                                    height: 46,
                                                    fontSize: "0.85rem",
                                                    fontWeight: 700,
                                                    cursor: "pointer",
                                                    bgcolor: "var(--sl-accent)",
                                                    color: "var(--sl-ink)",
                                                    border: isSelected ? "3px solid var(--sl-ink)" : "1.5px solid var(--sl-ink)"
                                                }}
                                            >
                                                {g.first_name[0]}{g.last_name ? g.last_name[0] : ""}
                                            </Avatar>
                                        </Badge>
                                    </Tooltip>
                                );
                            })}
                    </Box>
                    {selectedClassmate && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                flexWrap: "wrap",
                                gap: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: "#F8FAFC"
                            }}
                        >
                            <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                    {selectedClassmate.first_name} {selectedClassmate.last_name}
                                </Typography>
                                {selectedClassmate.teacher_reaction && (
                                    <Typography sx={{ color: "#166534", fontSize: "0.8rem", fontWeight: 600 }}>
                                        Teacher reacted: {reactionEmojis[selectedClassmate.teacher_reaction] || ""}
                                    </Typography>
                                )}
                            </Box>
                            <audio controls autoPlay src={resolveFileUrl(selectedClassmate.voice_url)} style={{ height: 32, maxWidth: 220 }} />
                        </Box>
                    )}
                </Card>
            )}
            {pendingCount > 0 && (
                <Card
                    sx={{
                        px: { xs: 2, md: 2.5 },
py: { xs: 1.75, md: 2 },
mb: 3,
borderRadius: 3,
boxShadow: "none",
display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexWrap: "wrap",
                        gap: 2,
                        bgcolor: "#FFF7ED",
                        border: "1px solid #FED7AA"
                    }}
                >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box
                            sx={{
                                width: 40,
height: 40,
                                borderRadius: "50%",
                                bgcolor: "#EA580C",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                flexShrink: 0
                            }}
                        >
                            {pendingCount}
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                                🔔 You have {pendingCount} post{pendingCount !== 1 ? "s" : ""} waiting for your response!
                            </Typography>
                            <Typography sx={{ color: "#9A3412", fontSize: "0.85rem", mt: 0.3 }}>
                                {acknowledgedCount} of {actionablePosts.length} acknowledged so far
                            </Typography>
                        </Box>
                    </Box>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={() => navigate(
                            "/parent/all-updates",
                            { state: { studentId: selectedStudentId } }
                        )}
                        sx={{ fontWeight: 700, px: 3 }}
                    >
                        Review Now →
                    </Button>
                </Card>
            )}
            <Card sx={{ ...panelSx }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1.5 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--sl-ink)" }}>
                        Today's Updates
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                        {[
                            ["all", "All", todaysPosts.length],
                            ["homework", "Homework", todaysPosts.filter((p) => p.post_type !== "announcement").length],
                            ["announcement", "Notices", todaysPosts.filter((p) => p.post_type === "announcement").length]
                        ].map(([key, label, n]) => (
                            <Box key={key} role="button" tabIndex={0} onClick={() => setPostFilter(key)} sx={pillSx(postFilter === key)}>
                                {label}
                                <Box component="span" sx={{ px: 0.7, borderRadius: 99, fontSize: "0.72rem", bgcolor: postFilter === key ? "var(--sl-ink)" : "var(--sl-soft2)", color: postFilter === key ? "#fff" : "var(--sl-ink)" }}>
                                    {n}
                                </Box>
                            </Box>
                        ))}
                        {posts.length > 0 && (
                            <Typography
                                onClick={() => navigate(
                                    "/parent/all-updates",
                                    { state: { studentId: selectedStudentId } }
                                )}
                                sx={{ color: "var(--sl-ink)", fontWeight: 700, fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline" }}
                            >
                                View All Updates →
                            </Typography>
                        )}
                    </Box>
                </Box>
                {filteredPosts.length === 0 && (
                    <Box>
                        <Typography color="text.secondary">
                            No updates for today yet.
                        </Typography>
                        {posts.length > 0 && (
                            <Typography
                                onClick={() => navigate(
                                    "/parent/all-updates",
                                    { state: { studentId: selectedStudentId } }
                                )}
                                sx={{ color: "var(--sl-primary)", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", mt: 0.5 }}
                            >
                                Looking for something older? View All Updates →
                            </Typography>
                        )}
                    </Box>
                )}
                {displayedPosts.map((post) => (
                    <Box
                        key={`${post.post_type}-${post.id}`}
                        onClick={() => navigate(
                            `/parent/post/${post.post_type}/${post.id}/${selectedChild.student_id}`,
                            { state: { post, student: selectedChild } }
                        )}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            py: 1.5,
cursor: "pointer",
                            borderBottom: "1px solid var(--sl-border)",
                            "&:last-child": {
                                borderBottom: "none"
                            }
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: "12px",
                                    border: "1.5px solid var(--sl-ink)",
                                    bgcolor: "var(--sl-accent)",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    flexShrink: 0
                                }}
                            >
                                {post.post_type === "announcement" ? (
                                    <CampaignIcon sx={{ color: "var(--sl-ink)", fontSize: 20 }} />
                                ) : (
                                    <MenuBookIcon sx={{ color: "var(--sl-ink)", fontSize: 20 }} />
                                )}
                            </Box>
                            <Box>
                                <Typography sx={{ fontWeight: 600 }}>
                                    {post.title}
                                </Typography>
                                <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                                    {post.post_type === "announcement"
                                        ? `Announcement · ${post.target_audience}`
                                        : `${post.teacher_first_name} ${post.teacher_last_name} · ${post.subject_name}`}
                                </Typography>
                                {post.post_type !== "announcement" && <Box sx={{ mt: 0.5 }}><QuizTag post={post} variant="parent" /></Box>}
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
                ))}
            </Card>
        </Box>
    );
}
export default ParentDashboardPage;
