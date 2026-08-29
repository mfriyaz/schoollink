import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    Checkbox,
    Chip,
    CircularProgress,
    FormControlLabel,
    TextField,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DownloadIcon from "@mui/icons-material/DownloadOutlined";
import PhotoCameraIcon from "@mui/icons-material/PhotoCameraOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlined";
import MicIcon from "@mui/icons-material/MicOutlined";
import StopCircleIcon from "@mui/icons-material/StopCircleOutlined";

import {
    acknowledgePost,
    getMyChildren,
    getHomeworkForStudent,
    getAnnouncementsForStudent,
    uploadAttachment
} from "../../services/postService";

import {
    submitHomeworkPhoto,
    getSubmission
} from "../../services/homeworkSubmissionService";

import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";

import { resolveFileUrl } from "../../config";

const REACTION_EMOJI = {

    thumbs_up: "👍",

    heart: "❤️",

    star: "🌟"

};

function ViewPostPage() {

    const navigate = useNavigate();

    const location = useLocation();

    const params = useParams();

    const [post, setPost] = useState(location.state?.post || null);

    const [student, setStudent] = useState(location.state?.student || null);

    const [loading, setLoading] = useState(!location.state);

    const [loadError, setLoadError] = useState("");

    const [checked, setChecked] = useState(false);

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    const [isAcknowledged, setIsAcknowledged] = useState(
        location.state?.post ? location.state.post.is_acknowledged : false
    );

    const [existingSubmission, setExistingSubmission] = useState(null);

    const [loadingSubmission, setLoadingSubmission] = useState(true);

    const [submissionPhotos, setSubmissionPhotos] = useState([]);

    const [uploadingSubmission, setUploadingSubmission] = useState(false);

    const [submissionVoice, setSubmissionVoice] = useState(null);

    const [isRecordingSubmission, setIsRecordingSubmission] = useState(false);

    const [recordingSeconds, setRecordingSeconds] = useState(0);

    const [uploadingSubmissionVoice, setUploadingSubmissionVoice] = useState(false);

    const submissionRecorderRef = useRef(null);

    const submissionChunksRef = useRef([]);

    const submissionTimerRef = useRef(null);

    const [submittingWork, setSubmittingWork] = useState(false);

    const [submissionError, setSubmissionError] = useState("");

    const [submissionSuccess, setSubmissionSuccess] = useState("");

    const [parentRemarks, setParentRemarks] = useState("");

    useEffect(() => {

        // If we already have the post/student (came from clicking
        // it on the dashboard), there's nothing to fetch. This
        // effect only runs when arriving via a direct URL - a
        // notification click, a refresh, or a bookmark.
        if (location.state?.post) {

            return;

        }

        loadFromUrl();

    }, []);

    useEffect(() => {

        if (post && student && post.post_type !== "announcement") {

            loadExistingSubmission();

        } else {

            setLoadingSubmission(false);

        }

    }, [post, student]);

    async function loadExistingSubmission() {

        try {

            setLoadingSubmission(true);

            const response = await getSubmission(post.id, student.student_id);

            if (response.success && response.data) {

                setExistingSubmission(response.data);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoadingSubmission(false);

        }

    }

    const MAX_PHOTOS = 5;

    async function handleSubmissionFileSelect(e) {

        const files = Array.from(e.target.files);

        if (files.length === 0) {

            return;

        }

        setSubmissionError("");

        if (submissionPhotos.length + files.length > MAX_PHOTOS) {

            setSubmissionError(`You can upload up to ${MAX_PHOTOS} photos total.`);

            e.target.value = "";

            return;

        }

        try {

            setUploadingSubmission(true);

            const uploaded = [];

            for (const file of files) {

                const response = await uploadAttachment(file);

                if (response.success) {

                    uploaded.push({

                        url: response.data.url,

                        name: response.data.original_name

                    });

                } else {

                    setSubmissionError(response.message);

                    break;

                }

            }

            setSubmissionPhotos((prev) => [...prev, ...uploaded]);

        } catch (err) {

            setSubmissionError(
                err.response?.data?.message ||
                "Unable to upload one of these photos."
            );

        } finally {

            setUploadingSubmission(false);

            e.target.value = "";

        }

    }

    function handleRemovePhoto(index) {

        setSubmissionPhotos((prev) => prev.filter((_, i) => i !== index));

    }

    // Chrome/Android record in webm; Safari on iPhone doesn't
    // support webm at all and records in mp4 instead. Detecting
    // the actual supported format (rather than hardcoding one)
    // is what makes playback work correctly on both.
    function getSupportedAudioMimeType() {

        if (MediaRecorder.isTypeSupported("audio/webm")) {

            return "audio/webm";

        }

        if (MediaRecorder.isTypeSupported("audio/mp4")) {

            return "audio/mp4";

        }

        return "";

    }

    async function handleStartSubmissionRecording() {

        setSubmissionError("");

        try {

            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            const mimeType = getSupportedAudioMimeType();

            const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);

            submissionChunksRef.current = [];

            recorder.ondataavailable = (e) => {

                if (e.data.size > 0) {

                    submissionChunksRef.current.push(e.data);

                }

            };

            recorder.onstop = async () => {

                stream.getTracks().forEach((track) => track.stop());

                clearInterval(submissionTimerRef.current);

                const actualType = recorder.mimeType || "audio/webm";

                const fileExtension = actualType.includes("mp4") ? "mp4" : "webm";

                const audioBlob = new Blob(submissionChunksRef.current, { type: actualType });

                const audioFile = new File([audioBlob], `submission-${Date.now()}.${fileExtension}`, { type: actualType });

                try {

                    setUploadingSubmissionVoice(true);

                    const response = await uploadAttachment(audioFile);

                    if (response.success) {

                        setSubmissionVoice({

                            url: response.data.url

                        });

                    } else {

                        setSubmissionError(response.message);

                    }

                } catch (err) {

                    setSubmissionError(

                        err.response?.data?.message ||
                        "Unable to upload this recording."

                    );

                } finally {

                    setUploadingSubmissionVoice(false);

                }

            };

            submissionRecorderRef.current = recorder;

            recorder.start();

            setIsRecordingSubmission(true);

            setRecordingSeconds(0);

            submissionTimerRef.current = setInterval(() => {

                setRecordingSeconds((s) => s + 1);

            }, 1000);

        } catch (err) {

            setSubmissionError(

                "Unable to access the microphone. Please allow microphone access and try again."

            );

        }

    }

    function handleStopSubmissionRecording() {

        if (submissionRecorderRef.current) {

            submissionRecorderRef.current.stop();

            setIsRecordingSubmission(false);

        }

    }

    function handleRemoveSubmissionVoice() {

        setSubmissionVoice(null);

    }

    async function handleSubmitWork() {

        setSubmissionError("");

        setSubmissionSuccess("");

        if (submissionPhotos.length === 0 && !submissionVoice) {

            setSubmissionError("Please add at least one photo or a voice recording.");

            return;

        }

        try {

            setSubmittingWork(true);

            const response = await submitHomeworkPhoto({

                homework_id: post.id,

                student_id: student.student_id,

                photo_urls: submissionPhotos.map((p) => p.url),

                voice_url: submissionVoice ? submissionVoice.url : null

            });

            if (response.success) {

                setExistingSubmission(response.data);

                setSubmissionPhotos([]);

                setSubmissionVoice(null);

                setSubmissionSuccess("Homework submitted successfully!");

            } else {

                setSubmissionError(response.message);

            }

        } catch (err) {

            setSubmissionError(
                err.response?.data?.message ||
                "Unable to submit this work."
            );

        } finally {

            setSubmittingWork(false);

        }

    }

    async function loadFromUrl() {

        const { postType, postId, studentId } = params;

        try {

            const childrenResponse = await getMyChildren();

            const matchedStudent = childrenResponse.success
                ? childrenResponse.data.find(
                    (c) => String(c.student_id) === studentId
                )
                : null;

            if (!matchedStudent) {

                setLoadError("This post isn't linked to one of your children.");

                return;

            }

            setStudent(matchedStudent);

            const feedResponse = postType === "announcement"
                ? await getAnnouncementsForStudent(studentId)
                : await getHomeworkForStudent(studentId);

            if (!feedResponse.success) {

                setLoadError(feedResponse.message);

                return;

            }

            const matchedPost = feedResponse.data.find(
                (p) => String(p.id) === postId
            );

            if (!matchedPost) {

                setLoadError("This post could not be found.");

                return;

            }

            const postWithType = { ...matchedPost, post_type: postType };

            setPost(postWithType);

            setIsAcknowledged(postWithType.is_acknowledged);

        } catch (err) {

            setLoadError(
                err.response?.data?.message ||
                "Unable to load this post."
            );

        } finally {

            setLoading(false);

        }

    }

    if (loading) {

        return (

            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                <CircularProgress />

            </Box>

        );

    }

    if (loadError || !post || !student) {

        return (

            <Box>

                <Typography color="text.secondary">

                    {loadError || "No post selected. Please go back to your dashboard."}

                </Typography>

                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/parent/dashboard")}
                    sx={{ mt: 2 }}
                >

                    Back to Posts

                </Button>

            </Box>

        );

    }

    const isAnnouncement = post.post_type === "announcement";

    async function handleAcknowledge() {

        setError("");

        try {

            setSubmitting(true);

            const response = await acknowledgePost({

                post_type: post.post_type || "homework",

                post_id: post.id,

                student_id: student.student_id,

                remarks: parentRemarks || null

            });

            if (response.success) {

                setIsAcknowledged(true);

            } else {

                setError(response.message);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to submit acknowledgement."
            );

        } finally {

            setSubmitting(false);

        }

    }

    return (

        <Box sx={{ maxWidth: 680 }}>

            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => navigate("/parent/dashboard")}
                sx={{ mb: 2, color: "#64748B" }}
            >

                Back to Posts

            </Button>

            <Card sx={{ p: 3.5 }}>

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>

                    <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>

                        <Box

                            sx={{

                                width: 44,

                                height: 44,

                                borderRadius: "12px",

                                bgcolor: isAnnouncement ? "#EDE9FE" : "#DBEAFE",

                                display: "flex",

                                alignItems: "center",

                                justifyContent: "center",

                                flexShrink: 0

                            }}

                        >

                            {isAnnouncement ? (

                                <CampaignIcon sx={{ color: "#7C3AED" }} />

                            ) : (

                                <MenuBookIcon sx={{ color: "#2563EB" }} />

                            )}

                        </Box>

                        <Box>

                            <Typography variant="h6" sx={{ fontWeight: 700 }}>

                                {post.title}

                            </Typography>

                            <Typography sx={{ color: "#64748B", fontSize: "0.88rem", mt: 0.3 }}>

                                {isAnnouncement
                                    ? `Announcement · ${post.target_audience}`
                                    : `${post.teacher_first_name} ${post.teacher_last_name} · ${post.subject_name} · ${student.class_name}`}

                            </Typography>

                        </Box>

                    </Box>

                    <Chip
                        color={isAcknowledged ? "success" : post.require_acknowledgement === false ? "default" : "warning"}
                        label={isAcknowledged ? "Acknowledged" : post.require_acknowledgement === false ? "No Action Needed" : "Pending"}
                        sx={{ fontWeight: 600 }}
                    />

                </Box>

                <Typography sx={{ mb: 3, color: "#334155", whiteSpace: "pre-line" }}>

                    {post.description}

                </Typography>

                {post.image_urls && post.image_urls.length > 0 && (

                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 3 }}>

                        {post.image_urls.map((url, i) => (

                            <Box

                                key={i}

                                component="a"

                                href={resolveFileUrl(url)}

                                target="_blank"

                                rel="noopener noreferrer"
                            >

                                <Box

                                    component="img"

                                    src={resolveFileUrl(url)}

                                    sx={{

                                        width: 140,

                                        height: 140,

                                        objectFit: "cover",

                                        borderRadius: 2,

                                        border: "1px solid #E2E8F0",

                                        display: "block"

                                    }}

                                />

                            </Box>

                        ))}

                    </Box>

                )}

                {post.attachment_url && (

                    <Box

                        component="a"

                        href={resolveFileUrl(post.attachment_url)}

                        target="_blank"

                        rel="noopener noreferrer"

                        sx={{

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "space-between",

                            border: "1px solid #E2E8F0",

                            borderRadius: 2,

                            p: 1.5,

                            mb: 3,

                            textDecoration: "none",

                            color: "inherit"

                        }}

                    >

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

                            <InsertDriveFileIcon sx={{ color: "#2563EB" }} />

                            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>

                                {post.attachment_url.split("/").pop()}

                            </Typography>

                        </Box>

                        <DownloadIcon sx={{ color: "#64748B" }} />

                    </Box>

                )}

                {post.voice_note_url && (

                    <Box

                        sx={{

                            display: "flex",

                            alignItems: "center",

                            gap: 1.5,

                            border: "1px solid #E2E8F0",

                            borderRadius: 2,

                            p: 1.5,

                            mb: 3

                        }}

                    >

                        <Typography sx={{ fontWeight: 600, fontSize: "0.85rem", color: "#334155", whiteSpace: "nowrap" }}>

                            🎤 Voice Note

                        </Typography>

                        <audio controls src={resolveFileUrl(post.voice_note_url)} style={{ height: 36, flex: 1 }} />

                    </Box>

                )}

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {isAcknowledged ? (

                    <Alert severity="success">

                        You've acknowledged this post
                        {post.acknowledged_at
                            ? ` on ${toUtcDate(post.acknowledged_at).toLocaleString(undefined, { timeZone: getSchoolTimezone() })}`
                            : ""}.
                        {post.remarks && (

                            <Box sx={{ mt: 1, fontStyle: "italic" }}>

                                "{post.remarks}"

                            </Box>

                        )}

                    </Alert>

                ) : post.require_acknowledgement === false ? (

                    <Alert severity="info">

                        This post doesn't require acknowledgement.

                    </Alert>

                ) : (

                    <Box sx={{ bgcolor: "#F1F5F9", p: 2.5, borderRadius: 3 }}>

                        <Typography sx={{ mb: 1.5, fontWeight: 500 }}>

                            Please acknowledge this post after reading

                        </Typography>

                        <FormControlLabel
                            control={

                                <Checkbox
                                    checked={checked}
                                    onChange={(e) => setChecked(e.target.checked)}
                                />

                            }
                            label="I acknowledge this post"
                        />

                        <TextField
                            label="Add a remark (optional)"
                            placeholder="e.g. He finished it with some help on question 3"
                            value={parentRemarks}
                            onChange={(e) => setParentRemarks(e.target.value)}
                            multiline
                            minRows={2}
                            fullWidth
                            sx={{ mt: 2, mb: 2 }}
                        />
                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>

                            <Button
                                variant="contained"
                                disabled={!checked || submitting}
                                onClick={handleAcknowledge}
                            >

                                {submitting ? "Submitting..." : "Submit Acknowledgement"}

                            </Button>

                        </Box>

                    </Box>

                )}

            </Card>

            {!isAnnouncement && !loadingSubmission && (post.allow_photo_submission || post.allow_voice_submission) && (

                <Card sx={{ p: 3.5, mt: 3 }}>

                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>

                        Submit Your Work

                    </Typography>

                    {submissionError && <Alert severity="error" sx={{ mb: 2 }}>{submissionError}</Alert>}

                    {submissionSuccess && <Alert severity="success" sx={{ mb: 2 }}>{submissionSuccess}</Alert>}

                    {existingSubmission && submissionPhotos.length === 0 && !submissionVoice ? (

                        <Box>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>

                                <CheckCircleIcon sx={{ color: "#16A34A" }} />

                                <Typography sx={{ color: "#16A34A", fontWeight: 600 }}>

                                    Submitted on {toUtcDate(existingSubmission.submitted_at).toLocaleString(undefined, { timeZone: getSchoolTimezone() })}

                                    {existingSubmission.photo_urls && existingSubmission.photo_urls.length > 0 &&
                                        ` (${existingSubmission.photo_urls.length} photo${existingSubmission.photo_urls.length !== 1 ? "s" : ""})`}

                                    {existingSubmission.voice_url && " (voice recording)"}

                                </Typography>

                                {existingSubmission.reaction && (

                                    <Chip

                                        size="small"

                                        label={`Teacher reacted ${REACTION_EMOJI[existingSubmission.reaction] || ""}`}

                                        sx={{ bgcolor: "#EDE9FE", color: "#7C3AED", fontWeight: 600 }}

                                    />

                                )}

                            </Box>

                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>

                                {existingSubmission.photo_urls && existingSubmission.photo_urls.map((url, i) => (

                                    <Box
                                        key={i}
                                        component="img"
                                        src={resolveFileUrl(url)}
                                        sx={{

                                            width: 110,

                                            height: 110,

                                            objectFit: "cover",

                                            borderRadius: 2,

                                            border: "1px solid #E2E8F0"

                                        }}
                                    />

                                ))}

                            </Box>

                            {existingSubmission.voice_url && (

                                <Box sx={{ mb: 2 }}>

                                    <audio controls src={resolveFileUrl(existingSubmission.voice_url)} style={{ height: 36, maxWidth: 280 }} />

                                </Box>

                            )}

                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>

                                {post.allow_photo_submission && (

                                    <Button
                                        component="label"
                                        variant="outlined"
                                        startIcon={<PhotoCameraIcon />}
                                    >

                                        Resubmit With New Photos

                                        <input
                                            type="file"
                                            hidden
                                            multiple
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={handleSubmissionFileSelect}
                                        />

                                    </Button>

                                )}

                                {post.allow_voice_submission && (

                                    <Button
                                        variant="outlined"
                                        startIcon={<MicIcon />}
                                        onClick={handleStartSubmissionRecording}
                                    >

                                        Re-record Voice

                                    </Button>

                                )}

                            </Box>
                        </Box>

                    ) : (

                        <Box>

                            {post.allow_photo_submission && (

                                <Box sx={{ mb: post.allow_voice_submission ? 3 : 0 }}>

                                    <Typography sx={{ color: "#64748B", mb: 2 }}>

                                        Take up to {MAX_PHOTOS} photos of your child's completed work and upload them here.

                                    </Typography>

                                    {submissionPhotos.length > 0 && (

                                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>

                                            {submissionPhotos.map((photo, i) => (

                                                <Box key={i} sx={{ position: "relative" }}>

                                                    <Box
                                                        component="img"
                                                        src={resolveFileUrl(photo.url)}
                                                        sx={{

                                                            width: 110,

                                                            height: 110,

                                                            objectFit: "cover",

                                                            borderRadius: 2,

                                                            border: "1px solid #E2E8F0"

                                                        }}
                                                    />

                                                    <Button
                                                        onClick={() => handleRemovePhoto(i)}
                                                        sx={{

                                                            position: "absolute",

                                                            top: -8,

                                                            right: -8,

                                                            minWidth: "auto",

                                                            width: 24,

                                                            height: 24,

                                                            borderRadius: "50%",

                                                            bgcolor: "#DC2626",

                                                            color: "white",

                                                            fontSize: "0.7rem",

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

                                    {submissionPhotos.length < MAX_PHOTOS && (

                                        <Button
                                            component="label"
                                            variant="outlined"
                                            startIcon={uploadingSubmission ? <CircularProgress size={16} /> : <PhotoCameraIcon />}
                                            disabled={uploadingSubmission}
                                            fullWidth
                                            sx={{ justifyContent: "flex-start", color: "#64748B", borderColor: "#E2E8F0", py: 1.5 }}
                                        >

                                            {uploadingSubmission ? "Uploading..." : `Upload Photo${submissionPhotos.length > 0 ? "s" : ""} (${submissionPhotos.length}/${MAX_PHOTOS})`}

                                            <input
                                                type="file"
                                                hidden
                                                multiple
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={handleSubmissionFileSelect}
                                            />

                                        </Button>

                                    )}

                                </Box>

                            )}

                            {post.allow_voice_submission && (

                                <Box>

                                    <Typography sx={{ color: "#64748B", mb: 2 }}>

                                        Record your child reading this homework aloud.

                                    </Typography>

                                    {submissionVoice ? (

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2, flexWrap: "wrap" }}>

                                            <audio controls src={resolveFileUrl(submissionVoice.url)} style={{ height: 36, maxWidth: 220 }} />

                                            <Button size="small" color="error" onClick={handleRemoveSubmissionVoice}>

                                                Remove

                                            </Button>

                                        </Box>

                                    ) : isRecordingSubmission ? (

                                        <Button
                                            variant="outlined"
                                            color="error"
                                            startIcon={<StopCircleIcon />}
                                            onClick={handleStopSubmissionRecording}
                                            fullWidth
                                            sx={{ py: 1.5 }}
                                        >

                                            Stop Recording ({recordingSeconds}s)

                                        </Button>

                                    ) : (

                                        <Button
                                            variant="outlined"
                                            startIcon={uploadingSubmissionVoice ? <CircularProgress size={16} /> : <MicIcon />}
                                            disabled={uploadingSubmissionVoice}
                                            onClick={handleStartSubmissionRecording}
                                            fullWidth
                                            sx={{ justifyContent: "flex-start", color: "#64748B", borderColor: "#E2E8F0", py: 1.5 }}
                                        >

                                            {uploadingSubmissionVoice ? "Uploading..." : "Start Recording"}

                                        </Button>

                                    )}

                                </Box>

                            )}

                            {(submissionPhotos.length > 0 || submissionVoice) && (

                                <Button
                                    variant="contained"
                                    onClick={handleSubmitWork}
                                    disabled={submittingWork}
                                    fullWidth
                                    sx={{ mt: 3 }}
                                >

                                    {submittingWork ? "Submitting..." : "Submit"}

                                </Button>

                            )}

                        </Box>

                    )}

                </Card>

            )}

        </Box>

    );

}

export default ViewPostPage;
