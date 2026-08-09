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
    Typography
} from "@mui/material";

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
    getTodaysGreeting
} from "../../services/morningGreetingService";

import { toUtcDate, formatPostTime, getSchoolTimezone } from "../../utils/dateUtils";

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

    const greetingRecorderRef = useRef(null);

    const greetingChunksRef = useRef([]);

    const greetingTimerRef = useRef(null);

    async function handleStartGreetingRecording() {

        setGreetingError("");

        try {

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const recorder = new MediaRecorder(stream);

            greetingChunksRef.current = [];

            recorder.ondataavailable = (e) => {

                if (e.data.size > 0) {

                    greetingChunksRef.current.push(e.data);

                }

            };

            recorder.onstop = () => {

                stream.getTracks().forEach((track) => track.stop());

                clearInterval(greetingTimerRef.current);

                const audioBlob = new Blob(greetingChunksRef.current, { type: "audio/webm" });

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

            const audioFile = new File(

                [previewAudioBlob],
                `greeting-${Date.now()}.webm`,
                { type: "audio/webm" }

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

        setLoading(false);

    }

    const selectedChild = children.find(
        (c) => c.student_id === selectedStudentId
    );

    const filteredPosts = postFilter === "all"
        ? posts
        : posts.filter((p) => p.post_type === postFilter);

    const displayedPosts = filteredPosts.slice(0, 5);

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

    return (

        <Box>

            <Box

                sx={{

                    display: "flex",

                    justifyContent: "space-between",

                    alignItems: "flex-start",

                    mb: 4

                }}

            >

                <Box>

                    <Typography sx={{ color: "#64748B", fontSize: "0.95rem" }}>

                        {getGreeting()},

                    </Typography>

                    <Typography variant="h4" sx={{ fontWeight: 700, mt: 0.3 }}>

                        {user ? user.full_name : "Parent"} 🤝

                    </Typography>

                    <Typography sx={{ color: "#64748B", mt: 0.5 }}>

                        Here's what's new for today.

                    </Typography>

                </Box>

                {children.length > 1 ? (

                    <TextField
                        select
                        size="small"
                        value={selectedStudentId}
                        onChange={(e) => handleChildChange(e.target.value)}
                        sx={{ minWidth: 220 }}
                    >

                        {children.map((c) => (

                            <MenuItem key={c.student_id} value={c.student_id}>

                                {c.first_name} {c.last_name}

                            </MenuItem>

                        ))}

                    </TextField>

                ) : (

                    selectedChild && (

                        <Card

                            sx={{

                                px: 2.5,

                                py: 1.5,

                                display: "flex",

                                alignItems: "center",

                                gap: 1.5

                            }}

                        >

                            <Avatar sx={{ bgcolor: "#2563EB" }}>

                                {selectedChild.first_name[0]}

                            </Avatar>

                            <Box>

                                <Typography sx={{ fontWeight: 600 }}>

                                    {selectedChild.first_name} {selectedChild.last_name}

                                </Typography>

                                <Typography sx={{ color: "#64748B", fontSize: "0.8rem" }}>

                                    {selectedChild.class_name} - {selectedChild.section_name}

                                </Typography>

                            </Box>

                        </Card>

                    )

                )}

            </Box>

            <Card sx={{ p: 3, mb: 3, bgcolor: todaysGreeting ? "#F0FDF4" : "#FFFBEB", border: todaysGreeting ? "1px solid #BBF7D0" : "1px solid #FDE68A" }}>

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

            {attendance.length > 0 && (() => {

                const dayFormatter = new Intl.DateTimeFormat("en-CA", {

                    timeZone: getSchoolTimezone()

                });

                const monthFormatter = new Intl.DateTimeFormat("en-CA", {

                    timeZone: getSchoolTimezone(),

                    year: "numeric",

                    month: "2-digit"

                });

                const todayKey = dayFormatter.format(new Date());

                const currentMonthKey = monthFormatter.format(new Date());

                const todayRecord = attendance.find(
                    (r) => dayFormatter.format(toUtcDate(r.attendance_date)) === todayKey
                );

                const thisMonthRecords = attendance.filter(
                    (r) => monthFormatter.format(toUtcDate(r.attendance_date)) === currentMonthKey
                );

                function renderStatusRow(record, label) {

                    const statusColor =
                        record.status === "Present" ? "success" :
                        record.status === "Late" ? "warning" : "error";

                    const statusIcon =
                        record.status === "Present" ? <CheckCircleIcon sx={{ fontSize: 20 }} /> :
                        record.status === "Late" ? <AccessTimeIcon sx={{ fontSize: 20 }} /> :
                        <CancelIcon sx={{ fontSize: 20 }} />;

                    const iconBg =
                        record.status === "Present" ? "#DCFCE7" :
                        record.status === "Late" ? "#FFEDD5" : "#FEE2E2";

                    const iconColor =
                        record.status === "Present" ? "#16A34A" :
                        record.status === "Late" ? "#EA580C" : "#DC2626";

                    return (

                        <Box

                            key={record.id}

                            sx={{

                                display: "flex",

                                alignItems: "center",

                                justifyContent: "space-between",

                                py: 1.5,

                                borderBottom: "1px solid #F1F5F9",

                                "&:last-of-type": { borderBottom: "none" }

                            }}

                        >

                            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                                <Box

                                    sx={{

                                        width: 36,

                                        height: 36,

                                        borderRadius: "10px",

                                        bgcolor: iconBg,

                                        color: iconColor,

                                        display: "flex",

                                        alignItems: "center",

                                        justifyContent: "center"

                                    }}

                                >

                                    {statusIcon}

                                </Box>

                                <Box>

                                    <Typography sx={{ fontWeight: 500, fontSize: "0.9rem" }}>

                                        {label}

                                    </Typography>

                                    {record.status === "Late" && record.remarks && (

                                        <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem" }}>

                                            {record.remarks}

                                        </Typography>

                                    )}

                                </Box>

                            </Box>

                            <Chip
                                size="small"
                                color={statusColor}
                                label={record.status}
                                sx={{ fontWeight: 600 }}
                            />

                        </Box>

                    );

                }

                return (

                    <Card sx={{ p: 3, mb: 3 }}>

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>

                            <Typography variant="h6" sx={{ fontWeight: 700 }}>

                                Attendance

                            </Typography>

                        </Box>

                        <Tabs

                            value={attendanceTab}

                            onChange={(e, val) => setAttendanceTab(val)}

                            sx={{ minHeight: 36, mb: 1.5, borderBottom: "1px solid #F1F5F9" }}

                        >

                            <Tab label="Today" value="today" sx={{ minHeight: 36, py: 0.5, fontSize: "0.85rem" }} />

                            <Tab label="This Month" value="month" sx={{ minHeight: 36, py: 0.5, fontSize: "0.85rem" }} />

                        </Tabs>

                        {attendanceTab === "today" ? (

                            todayRecord ? (

                                renderStatusRow(todayRecord, "Today")

                            ) : (

                                <Typography color="text.secondary">

                                    No attendance marked for today yet.

                                </Typography>

                            )

                        ) : (

                            thisMonthRecords.length === 0 ? (

                                <Typography color="text.secondary">

                                    No attendance records for this month yet.

                                </Typography>

                            ) : (

                                thisMonthRecords.map((record) =>
                                    renderStatusRow(

                                        record,

                                        toUtcDate(record.attendance_date).toLocaleDateString(undefined, {

                                            timeZone: getSchoolTimezone(),

                                            weekday: "short",

                                            month: "short",

                                            day: "numeric"

                                        })

                                    )
                                )
                            )

                        )}

                    </Card>

                );

            })()}


            {pendingCount > 0 && (

                <Card

                    sx={{

                        p: 3,

                        mb: 3,

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

                                width: 56,

                                height: 56,

                                borderRadius: "50%",

                                bgcolor: "#EA580C",

                                color: "white",

                                display: "flex",

                                alignItems: "center",

                                justifyContent: "center",

                                fontWeight: 700,

                                fontSize: "1.4rem",

                                flexShrink: 0

                            }}

                        >

                            {pendingCount}

                        </Box>

                        <Box>

                            <Typography sx={{ fontWeight: 700, fontSize: "1.05rem" }}>

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

            <Card sx={{ p: 3 }}>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1.5 }}>

                    <Typography variant="h6" sx={{ fontWeight: 700 }}>

                        Today's Updates

                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>

                        <Badge badgeContent={posts.length} color="primary" overlap="rectangular">

                            <Button
                                size="small"
                                variant={postFilter === "all" ? "contained" : "outlined"}
                                onClick={() => {

                                    setPostFilter("all");


                                }}
                                sx={{ pr: 2 }}
                            >

                                All Updates

                            </Button>

                        </Badge>

                        <Badge badgeContent={posts.filter((p) => p.post_type !== "announcement").length} color="primary" overlap="rectangular">

                            <Button
                                size="small"
                                variant={postFilter === "homework" ? "contained" : "outlined"}
                                onClick={() => {

                                    setPostFilter("homework");


                                }}
                                sx={{ pr: 2 }}
                            >

                                Homework

                            </Button>

                        </Badge>

                        <Badge badgeContent={posts.filter((p) => p.post_type === "announcement").length} color="primary" overlap="rectangular">

                            <Button
                                size="small"
                                variant={postFilter === "announcement" ? "contained" : "outlined"}
                                onClick={() => {

                                    setPostFilter("announcement");


                                }}
                                sx={{ pr: 2 }}
                            >

                                Announcements

                            </Button>

                        </Badge>

                        {posts.length > 5 && (

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

                    <Typography color="text.secondary">

                        No updates yet.

                    </Typography>

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

                            py: 2,

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
