import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    Card,
    Alert,
    FormControlLabel,
    Grid,
    MenuItem,
    Switch,
    TextField,
    Typography,
    CircularProgress
} from "@mui/material";

import EditNoteIcon from "@mui/icons-material/EditNoteOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUploadOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFileOutlined";
import CloseIcon from "@mui/icons-material/CloseOutlined";
import FlagIcon from "@mui/icons-material/FlagOutlined";
import MicIcon from "@mui/icons-material/MicOutlined";
import ImageIcon from "@mui/icons-material/ImageOutlined";

import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import StopCircleIcon from "@mui/icons-material/StopCircleOutlined";

import { resolveFileUrl } from "../../config";

import {
    getMyTeacherProfile,
    getMyAssignments,
    createHomeworkPost,
    uploadAttachment
} from "../../services/postService";

const priorities = ["Low", "Normal", "High"];

const priorityColors = {

    Low: "#64748B",

    Normal: "#16A34A",

    High: "#DC2626"

};

function CreatePostPage() {

    const navigate = useNavigate();

    const [assignments, setAssignments] = useState([]);

    const [classKey, setClassKey] = useState("");

    const [subjectId, setSubjectId] = useState("");

    const [title, setTitle] = useState("");

    const [description, setDescription] = useState("");

    const [priority, setPriority] = useState("Normal");

    const [requireAck, setRequireAck] = useState(true);

    const [allowPhotoSubmission, setAllowPhotoSubmission] = useState(true);

    const [allowVoiceSubmission, setAllowVoiceSubmission] = useState(false);

    const [allowViewAllSubmissions, setAllowViewAllSubmissions] = useState(false);

    const [homeworkDate, setHomeworkDate] = useState(
        new Date().toISOString().slice(0, 10)
    );

    const [dueDate, setDueDate] = useState("");

    const [attachment, setAttachment] = useState(null);

    const [images, setImages] = useState([]);

    const [uploadingImages, setUploadingImages] = useState(false);

    const [imageError, setImageError] = useState("");

    const [isRecording, setIsRecording] = useState(false);

    const [recordingSeconds, setRecordingSeconds] = useState(0);

    const [voiceNote, setVoiceNote] = useState(null);

    const [uploadingVoice, setUploadingVoice] = useState(false);

    const [voiceError, setVoiceError] = useState("");

    const [uploadingFile, setUploadingFile] = useState(false);

    const [uploadError, setUploadError] = useState("");

    const [loading, setLoading] = useState(true);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    useEffect(() => {

        loadAssignments();

    }, []);

    // Unique Class/Section options, derived from this teacher's
    // assignments (a teacher may teach more than one class).
    const classOptions = useMemo(() => {

        const seen = new Map();

        for (const a of assignments) {

            const key = `${a.class_id}-${a.section_id}`;

            if (!seen.has(key)) {

                seen.set(key, {

                    key,

                    label: `${a.class_name} - ${a.section_name}`

                });

            }

        }

        return Array.from(seen.values());

    }, [assignments]);

    // Subjects available for the currently selected class - a
    // teacher might teach more than one subject in the same class.
    const subjectOptions = useMemo(() => {

        return assignments.filter((a) => `${a.class_id}-${a.section_id}` === classKey);

    }, [assignments, classKey]);

    const selectedAssignment = subjectOptions.find(
        (a) => a.subject_id === subjectId
    );

    async function loadAssignments() {

        try {

            setError("");

            const profileResponse = await getMyTeacherProfile();

            if (!profileResponse.success) {

                setError(profileResponse.message);

                return;

            }

            const assignmentsResponse = await getMyAssignments(
                profileResponse.data.id
            );

            if (assignmentsResponse.success) {

                setAssignments(assignmentsResponse.data);

                if (assignmentsResponse.data.length > 0) {

                    const first = assignmentsResponse.data[0];

                    setClassKey(`${first.class_id}-${first.section_id}`);

                    setSubjectId(first.subject_id);

                }

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to load your classes/subjects."
            );

        } finally {

            setLoading(false);

        }

    }

    function handleClassChange(newClassKey) {

        setClassKey(newClassKey);

        const firstSubject = assignments.find(
            (a) => `${a.class_id}-${a.section_id}` === newClassKey
        );

        setSubjectId(firstSubject ? firstSubject.subject_id : "");

    }

    const mediaRecorderRef = useRef(null);

    const audioChunksRef = useRef([]);

    const timerRef = useRef(null);

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

    async function handleStartRecording() {

        setVoiceError("");

        try {

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mimeType = getSupportedAudioMimeType();

            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {

                if (e.data.size > 0) {

                    audioChunksRef.current.push(e.data);

                }

            };

            recorder.onstop = async () => {

                stream.getTracks().forEach((track) => track.stop());

                clearInterval(timerRef.current);

                const actualType = recorder.mimeType || "audio/webm";

                const fileExtension = actualType.includes("mp4") ? "mp4" : "webm";

                const audioBlob = new Blob(audioChunksRef.current, { type: actualType });

                const audioFile = new File([audioBlob], `voice-note-${Date.now()}.${fileExtension}`, { type: actualType });

                try {

                    setUploadingVoice(true);

                    const response = await uploadAttachment(audioFile);

                    if (response.success) {

                        setVoiceNote({

                            url: response.data.url,

                            durationLabel: formatDuration(recordingSeconds)

                        });

                    } else {

                        setVoiceError(response.message);

                    }

                } catch (err) {

                    setVoiceError(

                        err.response?.data?.message ||
                        "Unable to upload the voice note."

                    );

                } finally {

                    setUploadingVoice(false);

                }

            };

            mediaRecorderRef.current = recorder;

            recorder.start();

            setIsRecording(true);

            setRecordingSeconds(0);

            timerRef.current = setInterval(() => {

                setRecordingSeconds((s) => s + 1);

            }, 1000);

        } catch (err) {

            setVoiceError(

                "Couldn't access your microphone. Please allow microphone access and try again."

            );

        }

    }

    function handleStopRecording() {

        if (mediaRecorderRef.current) {

            mediaRecorderRef.current.stop();

        }

        setIsRecording(false);

    }

    function formatDuration(totalSeconds) {

        const minutes = Math.floor(totalSeconds / 60);

        const seconds = totalSeconds % 60;

        return `${minutes}:${String(seconds).padStart(2, "0")}`;

    }

    async function handleFileSelect(e) {

        const file = e.target.files[0];

        if (!file) {

            return;

        }

        setUploadError("");

        try {

            setUploadingFile(true);

            const response = await uploadAttachment(file);

            if (response.success) {

                setAttachment({

                    url: response.data.url,

                    name: response.data.original_name,

                    size: response.data.size

                });

            } else {

                setUploadError(response.message);

            }

        } catch (err) {

            setUploadError(
                err.response?.data?.message ||
                "Unable to upload this file."
            );

        } finally {

            setUploadingFile(false);

            e.target.value = "";

        }

    }

    const MAX_IMAGES = 3;

    async function handleImageSelect(e) {

        const files = Array.from(e.target.files);

        if (files.length === 0) {

            return;

        }

        setImageError("");

        if (images.length + files.length > MAX_IMAGES) {

            setImageError(`You can upload up to ${MAX_IMAGES} images per post.`);

            e.target.value = "";

            return;

        }

        try {

            setUploadingImages(true);

            const uploaded = [];

            for (const file of files) {

                const response = await uploadAttachment(file);

                if (response.success) {

                    uploaded.push({

                        url: response.data.url,

                        name: response.data.original_name

                    });

                } else {

                    setImageError(response.message);

                    break;

                }

            }

            setImages((prev) => [...prev, ...uploaded]);

        } catch (err) {

            setImageError(

                err.response?.data?.message ||
                "Unable to upload one of these images."

            );

        } finally {

            setUploadingImages(false);

            e.target.value = "";

        }

    }

    function handleRemoveImage(index) {

        setImages((prev) => prev.filter((_, i) => i !== index));

    }

    function formatFileSize(bytes) {

        if (bytes < 1024) return `${bytes} B`;

        if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;

    }

    async function handleSubmit() {

        setError("");

        setSuccess("");

        if (!selectedAssignment || !title || !dueDate) {

            setError(
                "Please select a Class, Subject and fill in Title and Due Date."
            );

            return;

        }

        try {

            setSubmitting(true);

            const response = await createHomeworkPost({

                teacher_subject_id: selectedAssignment.teacher_subject_id,

                title,

                description,

                homework_date: homeworkDate,

                due_date: dueDate,

                attachment_url: attachment ? attachment.url : null,

                image_urls: images.map((img) => img.url),

                priority,

                require_acknowledgement: requireAck,

                allow_photo_submission: allowPhotoSubmission,

                allow_voice_submission: allowVoiceSubmission,

                allow_view_all_submissions: allowViewAllSubmissions,

                voice_note_url: voiceNote ? voiceNote.url : null

            });

            if (response.success) {

                setSuccess("Post published successfully.");

                setTitle("");

                setDescription("");

                setDueDate("");

                setAttachment(null);

                setImages([]);

                setVoiceNote(null);

                setPriority("Normal");

                setRequireAck(true);

                setAllowPhotoSubmission(true);

                setAllowVoiceSubmission(false);

                setAllowViewAllSubmissions(false);

                setTimeout(() => {

                    navigate("/teacher/dashboard");

                }, 900);

            } else {

                setError(response.message);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to publish this post."
            );

        } finally {

            setSubmitting(false);

        }

    }

    if (loading) {

        return (

            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                <CircularProgress />

            </Box>

        );

    }

    return (

        <Box sx={{ maxWidth: 1100 }}>

            {/* ---------- Page header ---------- */}
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>

                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: "#DBEAFE",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <EditNoteIcon sx={{ color: "#2563EB" }} />
                </Box>

                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.3rem", md: "1.5rem" }, lineHeight: 1.2 }}>
                        Create New Post
                    </Typography>
                    <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                        Share homework with your class and keep parents informed.
                    </Typography>
                </Box>

            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

            {assignments.length === 0 ? (

                <Alert severity="warning">
                    You don't have any classes/subjects assigned yet.
                    Please contact your School Admin.
                </Alert>

            ) : (

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", md: "minmax(0, 3fr) minmax(0, 2fr)" },
                        gap: 3,
                        alignItems: "start"
                    }}
                >

                    {/* ================= LEFT: content ================= */}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                        {/* ----- Post details ----- */}
                        <PostSection title="Post details" subtitle="Who is this for, and what is it about?">

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                                <Grid container spacing={2}>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            select
                                            label="Class"
                                            value={classKey}
                                            onChange={(e) => handleClassChange(e.target.value)}
                                            fullWidth
                                        >
                                            {classOptions.map((c) => (
                                                <MenuItem key={c.key} value={c.key}>{c.label}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                    <Grid size={{ xs: 12, sm: 6 }}>
                                        <TextField
                                            select
                                            label="Subject"
                                            value={subjectId}
                                            onChange={(e) => setSubjectId(e.target.value)}
                                            fullWidth
                                        >
                                            {subjectOptions.map((a) => (
                                                <MenuItem key={a.subject_id} value={a.subject_id}>{a.subject_name}</MenuItem>
                                            ))}
                                        </TextField>
                                    </Grid>

                                </Grid>

                                <TextField
                                    label="Title"
                                    placeholder="e.g. Math Exercise 4"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    fullWidth
                                />

                                <TextField
                                    label="Description"
                                    placeholder="What should students/parents know about this?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    multiline
                                    minRows={5}
                                    fullWidth
                                />

                            </Box>

                        </PostSection>

                        {/* ----- Attachments ----- */}
                        <PostSection title="Attachments" subtitle="Optional. Add a file, photos or a voice note.">

                            {uploadError && <Alert severity="error" sx={{ mb: 1.5 }}>{uploadError}</Alert>}
                            {imageError && <Alert severity="error" sx={{ mb: 1.5 }}>{imageError}</Alert>}
                            {voiceError && <Alert severity="error" sx={{ mb: 1.5 }}>{voiceError}</Alert>}

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>

                                {/* File */}
                                <Box>
                                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", mb: 0.75 }}>
                                        PDF or image file
                                    </Typography>

                                    {attachment ? (
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                bgcolor: "#F8FAFC",
                                                border: "1px solid #E2E8F0",
                                                borderRadius: 2,
                                                p: 1.25
                                            }}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                                <Box
                                                    sx={{
                                                        width: 36, height: 36, minWidth: 36, borderRadius: "10px",
                                                        bgcolor: "#DBEAFE", color: "#2563EB",
                                                        display: "flex", alignItems: "center", justifyContent: "center"
                                                    }}
                                                >
                                                    <InsertDriveFileIcon fontSize="small" />
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.88rem" }} noWrap>
                                                        {attachment.name}
                                                    </Typography>
                                                    <Typography sx={{ color: "#64748B", fontSize: "0.76rem" }}>
                                                        {formatFileSize(attachment.size)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                            <Button
                                                size="small"
                                                onClick={() => setAttachment(null)}
                                                sx={{ minWidth: "auto", p: 0.5, color: "#64748B" }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Box
                                            component="label"
                                            sx={{
                                                display: "flex", alignItems: "center", gap: 1.25,
                                                border: "2px dashed #CBD5E1", borderRadius: 2, px: 2, py: 1.5,
                                                color: "#64748B", cursor: uploadingFile ? "default" : "pointer",
                                                "&:hover": { borderColor: "#2563EB", color: "#2563EB", bgcolor: "#F8FAFC" }
                                            }}
                                        >
                                            {uploadingFile ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                                            <Typography sx={{ fontSize: "0.88rem", fontWeight: 600 }}>
                                                {uploadingFile ? "Uploading..." : "Upload PDF or image"}
                                            </Typography>
                                            <input
                                                type="file"
                                                hidden
                                                disabled={uploadingFile}
                                                accept=".pdf,image/jpeg,image/png,image/webp"
                                                onChange={handleFileSelect}
                                            />
                                        </Box>
                                    )}
                                </Box>

                                {/* Photos */}
                                <Box>
                                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", mb: 0.75 }}>
                                        Photos (up to {MAX_IMAGES})
                                    </Typography>

                                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>

                                        {images.map((img, i) => (
                                            <Box key={i} sx={{ position: "relative", width: 96, height: 96 }}>
                                                <Box
                                                    component="img"
                                                    src={resolveFileUrl(img.url)}
                                                    sx={{
                                                        width: "100%", height: "100%", objectFit: "cover",
                                                        borderRadius: 2, border: "1px solid #E2E8F0"
                                                    }}
                                                />
                                                <Button
                                                    onClick={() => handleRemoveImage(i)}
                                                    sx={{
                                                        position: "absolute", top: -8, right: -8,
                                                        minWidth: "auto", width: 22, height: 22, borderRadius: "50%",
                                                        bgcolor: "#0F172A", color: "white", fontSize: "0.65rem", p: 0,
                                                        "&:hover": { bgcolor: "#DC2626" }
                                                    }}
                                                >
                                                    ✕
                                                </Button>
                                            </Box>
                                        ))}

                                        {images.length < MAX_IMAGES && (
                                            <Box
                                                component="label"
                                                sx={{
                                                    width: 96, height: 96, borderRadius: 2, border: "2px dashed #CBD5E1",
                                                    display: "flex", flexDirection: "column", alignItems: "center",
                                                    justifyContent: "center", gap: 0.5, color: "#64748B",
                                                    cursor: uploadingImages ? "default" : "pointer",
                                                    "&:hover": { borderColor: "#2563EB", color: "#2563EB", bgcolor: "#F8FAFC" }
                                                }}
                                            >
                                                {uploadingImages ? (
                                                    <CircularProgress size={22} />
                                                ) : (
                                                    <>
                                                        <ImageIcon />
                                                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>
                                                            Add ({images.length}/{MAX_IMAGES})
                                                        </Typography>
                                                    </>
                                                )}
                                                <input
                                                    type="file"
                                                    hidden
                                                    multiple
                                                    disabled={uploadingImages}
                                                    accept="image/jpeg,image/png,image/webp"
                                                    onChange={handleImageSelect}
                                                />
                                            </Box>
                                        )}

                                    </Box>
                                </Box>

                                {/* Voice note */}
                                <Box>
                                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600, color: "#334155", mb: 0.75 }}>
                                        Voice note
                                    </Typography>

                                    {voiceNote ? (
                                        <Box
                                            sx={{
                                                display: "flex", alignItems: "center", justifyContent: "space-between",
                                                bgcolor: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 2, p: 1.25
                                            }}
                                        >
                                            <audio controls src={resolveFileUrl(voiceNote.url)} style={{ height: 36, maxWidth: "100%", flex: 1, minWidth: 0 }} />
                                            <Button
                                                size="small"
                                                onClick={() => setVoiceNote(null)}
                                                sx={{ minWidth: "auto", p: 0.5, ml: 1, color: "#64748B" }}
                                            >
                                                <CloseIcon fontSize="small" />
                                            </Button>
                                        </Box>
                                    ) : isRecording ? (
                                        <Button
                                            variant="contained"
                                            color="error"
                                            startIcon={<StopCircleIcon />}
                                            onClick={handleStopRecording}
                                            fullWidth
                                            sx={{ py: 1.25 }}
                                        >
                                            Recording... {formatDuration(recordingSeconds)} (tap to stop)
                                        </Button>
                                    ) : (
                                        <Box
                                            onClick={() => !uploadingVoice && handleStartRecording()}
                                            sx={{
                                                display: "flex", alignItems: "center", gap: 1.25,
                                                border: "2px dashed #CBD5E1", borderRadius: 2, px: 2, py: 1.5,
                                                color: "#64748B", cursor: uploadingVoice ? "default" : "pointer",
                                                "&:hover": { borderColor: "#2563EB", color: "#2563EB", bgcolor: "#F8FAFC" }
                                            }}
                                        >
                                            {uploadingVoice ? <CircularProgress size={20} /> : <MicIcon />}
                                            <Typography sx={{ fontSize: "0.88rem", fontWeight: 600 }}>
                                                {uploadingVoice ? "Uploading..." : "Record a voice note"}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                            </Box>

                        </PostSection>

                    </Box>

                    {/* ================= RIGHT: settings ================= */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                            position: { md: "sticky" },
                            top: { md: 16 }
                        }}
                    >

                        <PostSection title="Schedule" subtitle="When it is set and when it is due.">

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                                <SchoolDatePicker
                                    label="Homework Date"
                                    value={homeworkDate}
                                    onChange={setHomeworkDate}
                                    fullWidth
                                />

                                <SchoolDatePicker
                                    label="Due Date"
                                    value={dueDate}
                                    onChange={setDueDate}
                                    fullWidth
                                />

                                <TextField
                                    select
                                    label="Priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    fullWidth
                                    InputProps={{
                                        startAdornment: (
                                            <FlagIcon sx={{ color: priorityColors[priority], mr: 1, fontSize: 20 }} />
                                        )
                                    }}
                                >
                                    {priorities.map((p) => (
                                        <MenuItem key={p} value={p}>{p}</MenuItem>
                                    ))}
                                </TextField>

                            </Box>

                        </PostSection>

                        <PostSection title="Options" subtitle="How parents and students respond.">

                            <ToggleRow
                                title="Require acknowledgement"
                                description={requireAck ? "Parents must confirm they have seen this." : "Informational only. No action needed."}
                                checked={requireAck}
                                onChange={setRequireAck}
                            />

                            <ToggleRow
                                title="Allow photo submission"
                                description="Students can upload a photo of completed work."
                                checked={allowPhotoSubmission}
                                onChange={setAllowPhotoSubmission}
                            />

                            <ToggleRow
                                title="Allow voice submission"
                                description="Good for reading homework."
                                checked={allowVoiceSubmission}
                                onChange={setAllowVoiceSubmission}
                            />

                            <ToggleRow
                                title="Show everyone's submissions"
                                description="Parents can see all submissions for this post, like a group chat."
                                checked={allowViewAllSubmissions}
                                onChange={setAllowViewAllSubmissions}
                                last
                            />

                        </PostSection>

                        <Box sx={{ display: "flex", gap: 1.5 }}>

                            <Button
                                variant="outlined"
                                onClick={() => navigate("/teacher/dashboard")}
                                sx={{ flex: 1 }}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={submitting}
                                sx={{ flex: 2 }}
                            >
                                {submitting ? "Publishing..." : "Publish Post"}
                            </Button>

                        </Box>

                    </Box>

                </Box>
            )}

        </Box>
    );
}

// ---------- Small layout helpers (styling only) ----------

function PostSection({ title, subtitle, children }) {
    return (
        <Card
            sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 3,
                border: "1px solid #EEF2F7",
                boxShadow: "0 1px 3px rgba(15,23,42,.06)"
            }}
        >
            <Box sx={{ mb: 2 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1rem", lineHeight: 1.3 }}>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography sx={{ color: "#64748B", fontSize: "0.78rem", mt: 0.25 }}>
                        {subtitle}
                    </Typography>
                )}
            </Box>

            {children}
        </Card>
    );
}

function ToggleRow({ title, description, checked, onChange, last }) {
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
                py: 1.25,
                borderBottom: last ? "none" : "1px solid #F1F5F9"
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.88rem" }}>
                    {title}
                </Typography>
                <Typography sx={{ color: "#64748B", fontSize: "0.76rem", mt: 0.25 }}>
                    {description}
                </Typography>
            </Box>

            <Switch
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
            />
        </Box>
    );
}

export default CreatePostPage;
