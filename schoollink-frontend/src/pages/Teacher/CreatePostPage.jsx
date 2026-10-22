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
import AiAssistButton from "../../components/common/AiAssistButton";
import HomeworkAiButton from "../../components/Teacher/HomeworkAiDialog";
import StopCircleIcon from "@mui/icons-material/StopCircleOutlined";

import { resolveFileUrl } from "../../config";

import {
    getMyTeacherProfile,
    getMyAssignments,
    createHomeworkPost,
    uploadAttachment
} from "../../services/postService";

const priorities = ["Low", "Normal", "High"];

function isoPlusDays(n) {
    const d = new Date();
    d.setDate(d.getDate() + n);
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

const dueQuick = [
    { label: "Tomorrow", days: 1 },
    { label: "In 3 days", days: 3 },
    { label: "Next week", days: 7 }
];

const pillSx = (active, color) => ({
    px: 1.5,
    py: 0.6,
    borderRadius: 99,
    cursor: "pointer",
    userSelect: "none",
    fontSize: "0.84rem",
    fontWeight: 700,
    border: "1.5px solid var(--sl-ink)",
    bgcolor: active ? (color || "var(--sl-accent)") : "transparent",
    color: active ? (color ? "#fff" : "var(--sl-ink)") : "var(--sl-ink)",
    "&:hover": { bgcolor: active ? undefined : "var(--sl-soft)" }
});

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
    const [answerKey, setAnswerKey] = useState("");

    const [priority, setPriority] = useState("Normal");

    const [requireAck, setRequireAck] = useState(true);

    const [allowPhotoSubmission, setAllowPhotoSubmission] = useState(true);

    const [allowVoiceSubmission, setAllowVoiceSubmission] = useState(false);

    const [allowViewAllSubmissions, setAllowViewAllSubmissions] = useState(false);

    const [homeworkDate, setHomeworkDate] = useState(
        new Date().toISOString().slice(0, 10)
    );

    const [dueDate, setDueDate] = useState("");
    const [closeDate, setCloseDate] = useState("");

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
    const [dueKey, setDueKey] = useState(0);

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

                submissions_close_date: closeDate || undefined,

                answer_key: answerKey || undefined,

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

                setAnswerKey("");

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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <Box
                    sx={{
                        width: 46, height: 46, borderRadius: "14px",
                        bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)",
                        boxShadow: "2px 2px 0 var(--sl-ink)",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                >
                    <EditNoteIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>
                        Create New Post
                    </Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
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
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        <PostSection n={1} title="Post details" subtitle="Who is this for, and what is it about?">
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                <Box>
                                    <FieldLabel>Class</FieldLabel>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {classOptions.map((c) => (
                                            <Box
                                                key={c.key}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => handleClassChange(c.key)}
                                                onKeyDown={(e) => e.key === "Enter" && handleClassChange(c.key)}
                                                sx={pillSx(c.key === classKey)}
                                            >
                                                {c.label}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                                <Box>
                                    <FieldLabel>Subject</FieldLabel>
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                                        {subjectOptions.map((a) => (
                                            <Box
                                                key={a.subject_id}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setSubjectId(a.subject_id)}
                                                onKeyDown={(e) => e.key === "Enter" && setSubjectId(a.subject_id)}
                                                sx={pillSx(a.subject_id === subjectId)}
                                            >
                                                {a.subject_name}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                                <HomeworkAiButton
                                    assignment={selectedAssignment}
                                    onUse={({ title: t, description: d, answer_key: k }) => { setTitle(t); setDescription(d); setAnswerKey(k || ""); }}
                                />
                                {answerKey && (
                                    <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: -1.5 }}>
                                        An answer key will be saved for you only (parents never see it).{" "}
                                        <Box component="span" role="button" tabIndex={0} onClick={() => setAnswerKey("")} sx={{ fontWeight: 800, textDecoration: "underline", cursor: "pointer", color: "var(--sl-ink)" }}>Don't save it</Box>
                                    </Typography>
                                )}
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
                                <AiAssistButton value={description} onApply={setDescription} />
                            </Box>
                        </PostSection>

                        <PostSection n={2} title="Attachments" subtitle="Optional. Add a file, photos or a voice note.">
                            {uploadError && <Alert severity="error" sx={{ mb: 1.5 }}>{uploadError}</Alert>}
                            {imageError && <Alert severity="error" sx={{ mb: 1.5 }}>{imageError}</Alert>}
                            {voiceError && <Alert severity="error" sx={{ mb: 1.5 }}>{voiceError}</Alert>}

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                                <Box>
                                    <FieldLabel>PDF or image file</FieldLabel>
                                    {attachment ? (
                                        <Box sx={filledSx}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                                                <Box sx={{ width: 36, height: 36, minWidth: 36, borderRadius: "10px", bgcolor: "var(--sl-accent)", color: "var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                                    <InsertDriveFileIcon fontSize="small" />
                                                </Box>
                                                <Box sx={{ minWidth: 0 }}>
                                                    <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }} noWrap>{attachment.name}</Typography>
                                                    <Typography sx={{ color: "text.secondary", fontSize: "0.76rem" }}>{formatFileSize(attachment.size)}</Typography>
                                                </Box>
                                            </Box>
                                            <Button size="small" aria-label="Remove file" onClick={() => setAttachment(null)} sx={{ minWidth: "auto", p: 0.5, color: "text.secondary" }}>
                                                <CloseIcon fontSize="small" />
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Box component="label" sx={{ ...dropSx, cursor: uploadingFile ? "default" : "pointer" }}>
                                            {uploadingFile ? <CircularProgress size={20} /> : <CloudUploadIcon />}
                                            <Typography sx={{ fontSize: "0.88rem", fontWeight: 700 }}>
                                                {uploadingFile ? "Uploading..." : "Upload PDF or image"}
                                            </Typography>
                                            <input type="file" hidden disabled={uploadingFile} accept=".pdf,image/jpeg,image/png,image/webp" onChange={handleFileSelect} />
                                        </Box>
                                    )}
                                </Box>

                                <Box>
                                    <FieldLabel>Photos (up to {MAX_IMAGES})</FieldLabel>
                                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
                                        {images.map((img, i) => (
                                            <Box key={i} sx={{ position: "relative", width: 96, height: 96 }}>
                                                <Box
                                                    component="img"
                                                    src={resolveFileUrl(img.url)}
                                                    sx={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 2, border: "1.5px solid var(--sl-ink)" }}
                                                />
                                                <Button
                                                    aria-label="Remove photo"
                                                    onClick={() => handleRemoveImage(i)}
                                                    sx={{
                                                        position: "absolute", top: -8, right: -8,
                                                        minWidth: "auto", width: 24, height: 24, borderRadius: "50%",
                                                        bgcolor: "var(--sl-ink)", color: "#fff", fontSize: "0.65rem", p: 0,
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
                                                    ...dropSx, width: 96, height: 96, p: 0, flexDirection: "column",
                                                    justifyContent: "center", gap: 0.5,
                                                    cursor: uploadingImages ? "default" : "pointer"
                                                }}
                                            >
                                                {uploadingImages ? (
                                                    <CircularProgress size={22} />
                                                ) : (
                                                    <>
                                                        <ImageIcon />
                                                        <Typography sx={{ fontSize: "0.72rem", fontWeight: 700 }}>
                                                            Add ({images.length}/{MAX_IMAGES})
                                                        </Typography>
                                                    </>
                                                )}
                                                <input type="file" hidden multiple disabled={uploadingImages} accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} />
                                            </Box>
                                        )}
                                    </Box>
                                </Box>

                                <Box>
                                    <FieldLabel>Voice note</FieldLabel>
                                    {voiceNote ? (
                                        <Box sx={filledSx}>
                                            <audio controls src={resolveFileUrl(voiceNote.url)} style={{ height: 36, maxWidth: "100%", flex: 1, minWidth: 0 }} />
                                            <Button size="small" aria-label="Remove voice note" onClick={() => setVoiceNote(null)} sx={{ minWidth: "auto", p: 0.5, ml: 1, color: "text.secondary" }}>
                                                <CloseIcon fontSize="small" />
                                            </Button>
                                        </Box>
                                    ) : isRecording ? (
                                        <Button variant="contained" color="error" startIcon={<StopCircleIcon />} onClick={handleStopRecording} fullWidth sx={{ py: 1.25 }}>
                                            Recording... {formatDuration(recordingSeconds)} (tap to stop)
                                        </Button>
                                    ) : (
                                        <Box onClick={() => !uploadingVoice && handleStartRecording()} sx={{ ...dropSx, cursor: uploadingVoice ? "default" : "pointer" }}>
                                            {uploadingVoice ? <CircularProgress size={20} /> : <MicIcon />}
                                            <Typography sx={{ fontSize: "0.88rem", fontWeight: 700 }}>
                                                {uploadingVoice ? "Uploading..." : "Record a voice note"}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>
                            </Box>
                        </PostSection>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 3, position: { md: "sticky" }, top: { md: 16 } }}>
                        <PostSection n={3} title="Schedule" subtitle="When it is set and when it is due.">
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                <SchoolDatePicker label="Homework Date" value={homeworkDate} onChange={setHomeworkDate} fullWidth />
                                <Box>
                                    <SchoolDatePicker key={dueKey} label="Due Date" value={dueDate} onChange={setDueDate} fullWidth />
                                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1 }}>
                                        {dueQuick.map((q) => (
                                            <Box
                                                key={q.label}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => { setDueDate(isoPlusDays(q.days)); setDueKey((k) => k + 1); }}
                                                sx={{ ...pillSx(false), fontSize: "0.76rem", py: 0.35, px: 1.1 }}
                                            >
                                                {q.label}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                                {(allowPhotoSubmission || allowVoiceSubmission) && (
                                    <Box>
                                        <SchoolDatePicker label="Accept submissions until (optional)" value={closeDate} onChange={setCloseDate} fullWidth />
                                        <Typography sx={{ color: "text.secondary", fontSize: "0.76rem", mt: 0.75 }}>
                                            Leave blank for due date + 3 days. After the due date, parents can still submit until this date, marked Late.
                                        </Typography>
                                    </Box>
                                )}
                                <Box>
                                    <FieldLabel>Priority</FieldLabel>
                                    <Box sx={{ display: "flex", gap: 1 }}>
                                        {priorities.map((p) => (
                                            <Box
                                                key={p}
                                                role="button"
                                                tabIndex={0}
                                                onClick={() => setPriority(p)}
                                                sx={{ ...pillSx(priority === p, priorityColors[p]), display: "flex", alignItems: "center", gap: 0.5 }}
                                            >
                                                <FlagIcon sx={{ fontSize: 16 }} />
                                                {p}
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        </PostSection>

                        <PostSection n={4} title="Options" subtitle="How parents and students respond.">
                            <ToggleRow title="Require acknowledgement" description={requireAck ? "Parents must confirm they have seen this." : "Informational only. No action needed."} checked={requireAck} onChange={setRequireAck} />
                            <ToggleRow title="Allow photo submission" description="Students can upload a photo of completed work." checked={allowPhotoSubmission} onChange={setAllowPhotoSubmission} />
                            <ToggleRow title="Allow voice submission" description="Good for reading homework." checked={allowVoiceSubmission} onChange={setAllowVoiceSubmission} />
                            <ToggleRow title="Show everyone's submissions" description="Parents can see all submissions for this post, like a group chat." checked={allowViewAllSubmissions} onChange={setAllowViewAllSubmissions} last />
                        </PostSection>

                        <Box sx={{ display: "flex", gap: 1.5 }}>
                            <Button variant="outlined" onClick={() => navigate("/teacher/dashboard")} sx={{ flex: 1 }}>
                                Cancel
                            </Button>
                            <Button
                                loading={submitting}
                                loadingPosition="start"
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

const dropSx = {
    display: "flex", alignItems: "center", gap: 1.25,
    border: "2px dashed var(--sl-border)", borderRadius: 2, px: 2, py: 1.5,
    color: "text.secondary",
    "&:hover": { borderColor: "var(--sl-ink)", color: "var(--sl-ink)", bgcolor: "var(--sl-soft)" }
};

const filledSx = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    bgcolor: "var(--sl-soft)", border: "1px solid var(--sl-border)", borderRadius: 2, p: 1.25
};

function FieldLabel({ children }) {
    return (
        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)", mb: 0.75 }}>
            {children}
        </Typography>
    );
}

function PostSection({ n, title, subtitle, children }) {
    return (
        <Card
            sx={{
                p: { xs: 2, md: 2.5 },
                borderRadius: 3,
                border: "1px solid var(--sl-border)",
                boxShadow: "var(--sl-card-shadow)"
            }}
        >
            <Box sx={{ mb: 2, display: "flex", alignItems: "center", gap: 1.25 }}>
                <Box
                    sx={{
                        width: 26, height: 26, minWidth: 26, borderRadius: "50%",
                        bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)",
                        color: "var(--sl-ink)", fontWeight: 800, fontSize: "0.78rem",
                        display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                >
                    {n}
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "1rem", lineHeight: 1.3, color: "var(--sl-ink)" }}>
                        {title}
                    </Typography>
                    {subtitle && (
                        <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>
                            {subtitle}
                        </Typography>
                    )}
                </Box>
            </Box>
            {children}
        </Card>
    );
}

function ToggleRow({ title, description, checked, onChange, last }) {
    return (
        <Box
            sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                gap: 2, py: 1.25,
                borderBottom: last ? "none" : "1px solid var(--sl-border)"
            }}
        >
            <Box sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }}>{title}</Typography>
                <Typography sx={{ color: "text.secondary", fontSize: "0.76rem", mt: 0.25 }}>{description}</Typography>
            </Box>
            <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
        </Box>
    );
}

export default CreatePostPage;
