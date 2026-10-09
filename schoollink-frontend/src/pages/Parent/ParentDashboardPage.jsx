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

import ParentAttendanceCard from "../../components/Parent/ParentAttendanceCard";
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
    border: "1px solid #EEF2F7",
    boxShadow: "0 1px 3px rgba(15,23,42,.06)"
};

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

            {/* ---------- Slim child bar ---------- */}
            <Box
                sx={{
                    mb: 1.5,
                    px: { xs: 1.5, md: 2 },
                    py: { xs: 1, md: 1.1 },
                    borderRadius: 3,
                    color: "#FFFFFF",
                    background: "linear-gradient(135deg,#2563EB,#4F46E5)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    flexWrap: "wrap"
                }}
            >

                <Avatar
                    sx={{
                        width: 34,
                        height: 34,
                        bgcolor: "rgba(255,255,255,0.22)",
                        color: "#FFFFFF",
                        fontWeight: 700,
                        fontSize: "0.95rem"
                    }}
                >
                    {selectedChild ? selectedChild.first_name[0] : "?"}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>

                    <Typography
                        sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.2 }}
                        noWrap
                    >
                        {selectedChild
                            ? `${selectedChild.first_name} ${selectedChild.last_name}`
                            : "Your child"}
                        {selectedChild && (
                            <Box
                                component="span"
                                sx={{ fontWeight: 500, opacity: 0.85, fontSize: "0.8rem", ml: 1 }}
                            >
                                {selectedChild.class_name} - {selectedChild.section_name}
                            </Box>
                        )}
                    </Typography>

                    <Typography sx={{ opacity: 0.85, fontSize: "0.74rem", lineHeight: 1.3 }} noWrap>
                        {getGreeting()}, {user ? user.full_name : "Parent"} 🤝
                    </Typography>

                </Box>

                {children.length > 1 && (
                    <TextField
                        select
                        size="small"
                        value={selectedStudentId}
                        onChange={(e) => handleChildChange(e.target.value)}
                        sx={{
                            minWidth: { xs: "100%", sm: 170 },
                            "& .MuiOutlinedInput-root": {
                                bgcolor: "rgba(255,255,255,0.95)",
                                borderRadius: 2,
                                fontSize: "0.85rem"
                            },
                            "& .MuiSelect-select": { py: 0.6 }
                        }}
                    >
                        {children.map((c) => (
                            <MenuItem key={c.student_id} value={c.student_id}>
                                {c.first_name} {c.last_name}
                            </MenuItem>
                        ))}
                    </TextField>
                )}

            </Box>

            {/* ---------- At-a-glance tiles ---------- */}
            {(() => {

                const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: getSchoolTimezone() });
                const todayStr = dayFmt.format(new Date());
                const todayAtt = attendance.find(
                    (r) => dayFmt.format(toUtcDate(r.attendance_date)) === todayStr
                );

                const attStatus = todayAtt ? todayAtt.status : "Not marked";
                const attColor =
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
                        fg: "#2563EB",
                        bg: "#DBEAFE",
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
                                    border: "1px solid #EEF2F7",
                                    boxShadow: "0 1px 3px rgba(15,23,42,.06)",
                                    cursor: t.onClick ? "pointer" : "default",
                                    "&:hover": t.onClick ? { boxShadow: "0 4px 12px rgba(15,23,42,.08)" } : {}
                                }}
                            >
                                <Box
                                    sx={{
                                        width: { xs: 32, md: 36 },
                                        height: { xs: 32, md: 36 },
                                        minWidth: { xs: 32, md: 36 },
                                        borderRadius: "10px",
                                        bgcolor: t.bg,
                                        color: t.fg,
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
                                            fontWeight: 700,
                                            fontSize: t.small ? { xs: "0.85rem", md: "0.95rem" } : { xs: "1.1rem", md: "1.25rem" },
                                            lineHeight: 1.15,
                                            color: t.small ? t.fg : "inherit"
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

            <Card sx={{ ...panelSx, mb: 3, bgcolor: todaysGreeting ? "#F0FDF4" : "#FFFBEB", border: todaysGreeting ? "1px solid #BBF7D0" : "1px solid #FDE68A" }}>

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

                                <Button
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

                <Card sx={{ ...panelSx, mb: 3 }}>

                    <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", mb: 0.5 }}>

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

                                                    bgcolor: "#DBEAFE",

                                                    color: "#2563EB",

                                                    border: isSelected ? "3px solid #2563EB" : "2px solid #BFDBFE"

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


            {attendance.length > 0 && <ParentAttendanceCard attendance={attendance} />}


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

                    <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>

                        Today's Updates

                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>

                        <Badge badgeContent={todaysPosts.length} color="primary" overlap="rectangular">

                            <Button
                                size="small"
                                variant={postFilter === "all" ? "contained" : "outlined"}
                                onClick={() => {

                                    setPostFilter("all");


                                }}
                                sx={{ pr: 2, borderRadius: 5, textTransform: "none", fontWeight: 600 }}
                            >

                                All Updates

                            </Button>

                        </Badge>

                        <Badge badgeContent={todaysPosts.filter((p) => p.post_type !== "announcement").length} color="primary" overlap="rectangular">

                            <Button
                                size="small"
                                variant={postFilter === "homework" ? "contained" : "outlined"}
                                onClick={() => {

                                    setPostFilter("homework");


                                }}
                                sx={{ pr: 2, borderRadius: 5, textTransform: "none", fontWeight: 600 }}
                            >

                                Homework

                            </Button>

                        </Badge>

                        <Badge badgeContent={todaysPosts.filter((p) => p.post_type === "announcement").length} color="primary" overlap="rectangular">

                            <Button
                                size="small"
                                variant={postFilter === "announcement" ? "contained" : "outlined"}
                                onClick={() => {

                                    setPostFilter("announcement");


                                }}
                                sx={{ pr: 2, borderRadius: 5, textTransform: "none", fontWeight: 600 }}
                            >

                                Announcements

                            </Button>

                        </Badge>

                        {posts.length > 0 && (

                            <Typography
                                onClick={() => navigate(

                                    "/parent/all-updates",

                                    { state: { studentId: selectedStudentId } }

                                )}
                                sx={{ color: "#2563EB", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
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

                                sx={{ color: "#2563EB", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", mt: 0.5 }}

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

                            borderBottom: "1px solid #F1F5F9",

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

                                    borderRadius: "10px",

                                    bgcolor: post.post_type === "announcement" ? "#EDE9FE" : "#DBEAFE",

                                    display: "flex",

                                    alignItems: "center",

                                    justifyContent: "center",

                                    flexShrink: 0

                                }}

                            >

                                {post.post_type === "announcement" ? (

                                    <CampaignIcon sx={{ color: "#7C3AED", fontSize: 20 }} />

                                ) : (

                                    <MenuBookIcon sx={{ color: "#2563EB", fontSize: 20 }} />

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
