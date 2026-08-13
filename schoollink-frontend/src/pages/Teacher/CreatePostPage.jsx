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

        <Box sx={{ maxWidth: 760 }}>

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

                <Typography variant="h5" sx={{ fontWeight: 700 }}>

                    Create New Post

                </Typography>

            </Box>

            <Card sx={{ p: 3.5 }}>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                    {error && <Alert severity="error">{error}</Alert>}

                    {success && <Alert severity="success">{success}</Alert>}

                    {assignments.length === 0 ? (

                        <Alert severity="warning">

                            You don't have any classes/subjects assigned yet.
                            Please contact your School Admin.

                        </Alert>

                    ) : (

                        <>

                            <Grid container spacing={2}>

                                <Grid size={{ xs: 12, sm: 6 }}>

                                    <TextField
                                        select
                                        label="Post Type"
                                        value="Homework"
                                        fullWidth
                                        disabled
                                        helperText="Teachers can post Homework. Admins post Announcements."
                                    >

                                        <MenuItem value="Homework">Homework</MenuItem>

                                    </TextField>

                                </Grid>

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
                                minRows={4}
                                fullWidth
                            />

                            <Grid container spacing={2}>

                                <Grid size={{ xs: 12, sm: 6 }}>

                                    <Typography sx={{ fontSize: "0.85rem", color: "#334155", mb: 1, fontWeight: 500 }}>

                                        Attachment

                                    </Typography>

                                    {uploadError && <Alert severity="error" sx={{ mb: 1.5 }}>{uploadError}</Alert>}

                                    {attachment ? (

                                        <Box

                                            sx={{

                                                display: "flex",

                                                alignItems: "center",

                                                justifyContent: "space-between",

                                                border: "1px solid #E2E8F0",

                                                borderRadius: 2,

                                                p: 1.5

                                            }}

                                        >

                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

                                                <InsertDriveFileIcon sx={{ color: "#2563EB" }} />

                                                <Box>

                                                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>

                                                        {attachment.name}

                                                    </Typography>

                                                    <Typography sx={{ color: "#64748B", fontSize: "0.78rem" }}>

                                                        {formatFileSize(attachment.size)}

                                                    </Typography>

                                                </Box>

                                            </Box>

                                            <Button
                                                size="small"
                                                onClick={() => setAttachment(null)}
                                                sx={{ minWidth: "auto", p: 0.5 }}
                                            >

                                                <CloseIcon fontSize="small" />

                                            </Button>

                                        </Box>

                                    ) : (

                                        <Button
                                            component="label"
                                            variant="outlined"
                                            startIcon={uploadingFile ? <CircularProgress size={16} /> : <CloudUploadIcon />}
                                            disabled={uploadingFile}
                                            fullWidth
                                            sx={{ justifyContent: "flex-start", color: "#64748B", borderColor: "#E2E8F0", py: 1.5 }}
                                        >

                                            {uploadingFile ? "Uploading..." : "Upload PDF or image"}

                                            <input
                                                type="file"
                                                hidden
                                                accept=".pdf,image/jpeg,image/png,image/webp"
                                                onChange={handleFileSelect}
                                            />

                                        </Button>

                                    )}

                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>

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

                                </Grid>

                            </Grid>

                            <Box>

                                <Typography sx={{ fontSize: "0.85rem", color: "#334155", mb: 1, fontWeight: 500 }}>

                                    Images (optional, up to {MAX_IMAGES})

                                </Typography>

                                {imageError && <Alert severity="error" sx={{ mb: 1.5 }}>{imageError}</Alert>}

                                {images.length > 0 && (

                                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 1.5 }}>

                                        {images.map((img, i) => (

                                            <Box key={i} sx={{ position: "relative" }}>

                                                <Box

                                                    component="img"

                                                    src={resolveFileUrl(img.url)}

                                                    sx={{

                                                        width: 90,

                                                        height: 90,

                                                        objectFit: "cover",

                                                        borderRadius: 2,

                                                        border: "1px solid #E2E8F0"

                                                    }}

                                                />

                                                <Button
                                                    onClick={() => handleRemoveImage(i)}
                                                    sx={{

                                                        position: "absolute",

                                                        top: -8,

                                                        right: -8,

                                                        minWidth: "auto",

                                                        width: 22,

                                                        height: 22,

                                                        borderRadius: "50%",

                                                        bgcolor: "#DC2626",

                                                        color: "white",

                                                        fontSize: "0.65rem",

                                                        p: 0,

                                                        "&:hover": { bgcolor: "#B91C1C" }

                                                    }}
                                                >

                                                    ✕

                                                </Button>

                                            </Box>

                                        ))}

                                    </Box>

                                )}

                                {images.length < MAX_IMAGES && (

                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={uploadingImages ? <CircularProgress size={16} /> : <ImageIcon />}
                                        disabled={uploadingImages}
                                        fullWidth
                                        sx={{ justifyContent: "flex-start", color: "#64748B", borderColor: "#E2E8F0", py: 1.5 }}
                                    >

                                        {uploadingImages ? "Uploading..." : `Add Image${images.length > 0 ? "s" : ""} (${images.length}/${MAX_IMAGES})`}

                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleImageSelect}
                                        />

                                    </Button>

                                )}

                            </Box>

                            <Box>

                                <Typography sx={{ fontSize: "0.85rem", color: "#334155", mb: 1, fontWeight: 500 }}>

                                    Voice Note (optional)

                                </Typography>

                                {voiceError && <Alert severity="error" sx={{ mb: 1.5 }}>{voiceError}</Alert>}

                                {voiceNote ? (

                                    <Box

                                        sx={{

                                            display: "flex",

                                            alignItems: "center",

                                            justifyContent: "space-between",

                                            border: "1px solid #E2E8F0",

                                            borderRadius: 2,

                                            p: 1.5

                                        }}

                                    >

                                        <audio controls src={resolveFileUrl(voiceNote.url)} style={{ height: 36, maxWidth: 260 }} />

                                        <Button
                                            size="small"
                                            onClick={() => setVoiceNote(null)}
                                            sx={{ minWidth: "auto", p: 0.5, ml: 1 }}
                                        >

                                            <CloseIcon fontSize="small" />

                                        </Button>

                                    </Box>

                                ) : isRecording ? (

                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<StopCircleIcon />}
                                        onClick={handleStopRecording}
                                        fullWidth
                                        sx={{ py: 1.5 }}
                                    >

                                        Recording... {formatDuration(recordingSeconds)} (tap to stop)

                                    </Button>

                                ) : (

                                    <Button
                                        variant="outlined"
                                        startIcon={uploadingVoice ? <CircularProgress size={16} /> : <MicIcon />}
                                        onClick={handleStartRecording}
                                        disabled={uploadingVoice}
                                        fullWidth
                                        sx={{ justifyContent: "flex-start", color: "#64748B", borderColor: "#E2E8F0", py: 1.5 }}
                                    >

                                        {uploadingVoice ? "Uploading..." : "Record a voice note"}

                                    </Button>

                                )}

                            </Box>

                            <Grid container spacing={2}>

                                <Grid size={{ xs: 12, sm: 6 }}>

                                    <SchoolDatePicker
                                        label="Homework Date"
                                        value={homeworkDate}
                                        onChange={setHomeworkDate}
                                        fullWidth
                                    />

                                </Grid>

                                <Grid size={{ xs: 12, sm: 6 }}>

                                    <SchoolDatePicker
                                        label="Due Date"
                                        value={dueDate}
                                        onChange={setDueDate}
                                        fullWidth
                                    />

                                </Grid>

                            </Grid>

                            <Box>

                                <Typography sx={{ fontSize: "0.85rem", color: "#334155", mb: 0.5, fontWeight: 500 }}>

                                    Require Acknowledgement

                                </Typography>

                                <FormControlLabel
                                    control={

                                        <Switch
                                            checked={requireAck}
                                            onChange={(e) => setRequireAck(e.target.checked)}
                                        />

                                    }
                                    label={requireAck ? "Yes, require acknowledgement" : "No, this is informational only"}
                                />

                            </Box>

                        </>

                    )}

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, pt: 1 }}>

                        <Button
                            variant="outlined"
                            onClick={() => navigate("/teacher/dashboard")}
                        >

                            Cancel

                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={submitting || assignments.length === 0}
                        >

                            {submitting ? "Publishing..." : "Publish Post"}

                        </Button>

                    </Box>

                </Box>

            </Card>

        </Box>

    );

}

export default CreatePostPage;
