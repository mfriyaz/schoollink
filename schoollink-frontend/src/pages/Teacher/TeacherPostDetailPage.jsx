import { useEffect, useState } from "react";
import ConfirmDialog from "../../components/common/ConfirmDialog";
import { notify } from "../../utils/notify";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import ImageIcon from "@mui/icons-material/ImageOutlined";
import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import {
    getHomeworkById,
    updateHomeworkPost,
    uploadAttachment
} from "../../services/postService";
import { resolveFileUrl } from "../../config";
import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";
const priorities = ["Low", "Normal", "High"];
const priorityColors = { Low: "#64748B", Normal: "#16A34A", High: "#DC2626" };
const MAX_IMAGES = 3;
function TeacherPostDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const [editing, setEditing] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState("Normal");
    const [homeworkDate, setHomeworkDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [allowPhotoSubmission, setAllowPhotoSubmission] = useState(true);
    const [allowVoiceSubmission, setAllowVoiceSubmission] = useState(false);
    const [allowViewAllSubmissions, setAllowViewAllSubmissions] = useState(false);
    const [images, setImages] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [saving, setSaving] = useState(false);
    const [confirmSave, setConfirmSave] = useState(false);
    const [saveError, setSaveError] = useState("");
    const [saveSuccess, setSaveSuccess] = useState("");
    useEffect(() => {
        loadPost();
    }, [id]);
    async function loadPost() {
        try {
            setLoading(true);
            setLoadError("");
            const response = await getHomeworkById(id);
            if (response.success) {
                const p = response.data;
                setPost(p);
                setTitle(p.title);
                setDescription(p.description || "");
                setPriority(p.priority || "Normal");
                setHomeworkDate(p.homework_date ? p.homework_date.slice(0, 10) : "");
                setDueDate(p.due_date ? p.due_date.slice(0, 10) : "");
                setAllowPhotoSubmission(
                    p.allow_photo_submission !== undefined ? p.allow_photo_submission : true
                );
                setAllowVoiceSubmission(
                    p.allow_voice_submission !== undefined ? p.allow_voice_submission : false
                );
                setAllowViewAllSubmissions(
                    p.allow_view_all_submissions !== undefined ? p.allow_view_all_submissions : false
                );
                setImages(
                    (p.image_urls || []).map((url) => ({ url }))
                );
            } else {
                setLoadError(response.message);
            }
        } catch (err) {
            setLoadError(
                err.response?.data?.message ||
                "Unable to load this post."
            );
        } finally {
            setLoading(false);
        }
    }
    async function handleImageSelect(e) {
        const files = Array.from(e.target.files);
        if (files.length === 0) {
            return;
        }
        if (images.length + files.length > MAX_IMAGES) {
            setSaveError(`You can have up to ${MAX_IMAGES} images per post.`);
            e.target.value = "";
            return;
        }
        try {
            setUploadingImages(true);
            const uploaded = [];
            for (const file of files) {
                const response = await uploadAttachment(file);
                if (response.success) {
                    uploaded.push({ url: response.data.url });
                }
            }
            setImages((prev) => [...prev, ...uploaded]);
        } catch (err) {
            setSaveError(
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
    async function handleSave() {
        setSaveError("");
        setSaveSuccess("");
        if (!title || !homeworkDate || !dueDate) {
            setSaveError("Title, homework date, and due date are required.");
            return;
        }
        try {
            setSaving(true);
            const response = await updateHomeworkPost(id, {
                title,
                description,
                priority,
                homework_date: homeworkDate,
                due_date: dueDate,
                attachment_url: post.attachment_url,
                image_urls: images.map((img) => img.url),
                allow_photo_submission: allowPhotoSubmission,
                allow_voice_submission: allowVoiceSubmission,
                allow_view_all_submissions: allowViewAllSubmissions
            });
            if (response.success) {
                setPost(response.data);
                setSaveSuccess("Post updated successfully!");
                notify("Post updated successfully.");
                setEditing(false);
            } else {
                setSaveError(response.message);
            }
        } catch (err) {
            setSaveError(
                err.response?.data?.message ||
                "Unable to save changes."
            );
        } finally {
            setSaving(false);
        }
    }
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }
    if (loadError || !post) {
        return (
            <Box sx={{ maxWidth: 700 }}>
                <Alert severity="error">{loadError || "Post not found."}</Alert>
            </Box>
        );
    }
    const dueInfo = (() => {
        if (!post.due_date) return null;
        const d = new Date(post.due_date.slice(0, 10) + "T00:00:00");
        if (isNaN(d)) return null;
        const t = new Date(); t.setHours(0, 0, 0, 0);
        const diff = Math.round((d - t) / 86400000);
        if (diff < 0) return { text: `Overdue by ${-diff} day${diff === -1 ? "" : "s"}`, color: "#DC2626" };
        if (diff === 0) return { text: "Due today", color: "#C2410C" };
        if (diff === 1) return { text: "Due tomorrow", color: "#C2410C" };
        return { text: `Due in ${diff} days`, color: "#15803D" };
    })();

    const prio = post.priority || "Normal";
    const prioColor = priorityColors[prio] || "#64748B";

    return (
        <Box sx={{ maxWidth: 760 }}>
            <Box
                onClick={() => navigate("/teacher/posts")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", cursor: "pointer", mb: 1.5, width: "fit-content" }}
            >
                <ArrowBackIcon fontSize="small" />
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>All posts</Typography>
            </Box>

            {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}
            {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{saveSuccess}</Alert>}

            <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1, gap: 1.5 }}>
                    {editing ? (
                        <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth />
                    ) : (
                        <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", sm: "1.55rem" }, lineHeight: 1.25, color: "var(--sl-ink)", wordBreak: "break-word" }}>
                            {post.title}
                        </Typography>
                    )}
                    {!editing && (
                        <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setEditing(true)} sx={{ flexShrink: 0 }}>
                            Edit
                        </Button>
                    )}
                </Box>

                <Typography sx={{ color: "text.secondary", fontSize: "0.8rem", mb: 2 }}>
                    Posted {toUtcDate(post.created_at).toLocaleString(undefined, { timeZone: getSchoolTimezone() })}
                    {post.updated_at && post.updated_at !== post.created_at &&
                        ` · Last edited ${toUtcDate(post.updated_at).toLocaleString(undefined, { timeZone: getSchoolTimezone() })}`
                    }
                </Typography>

                {editing ? (
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            minRows={4}
                            fullWidth
                        />

                        <Box>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)", mb: 0.75 }}>Priority</Typography>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                {priorities.map((p) => (
                                    <Box
                                        key={p}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => setPriority(p)}
                                        sx={{
                                            px: 1.5, py: 0.6, borderRadius: 99, cursor: "pointer", userSelect: "none",
                                            fontSize: "0.84rem", fontWeight: 700, border: "1.5px solid var(--sl-ink)",
                                            bgcolor: priority === p ? priorityColors[p] : "transparent",
                                            color: priority === p ? "#fff" : "var(--sl-ink)"
                                        }}
                                    >
                                        {p}
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                            <SchoolDatePicker label="Homework Date" value={homeworkDate} onChange={setHomeworkDate} fullWidth />
                            <SchoolDatePicker label="Due Date" value={dueDate} onChange={setDueDate} fullWidth />
                        </Box>

                        <Box>
                            <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)", mb: 0.5 }}>
                                Student submission options
                            </Typography>
                            {[
                                ["Allow photo submission", "Students can upload a photo of completed work.", allowPhotoSubmission, setAllowPhotoSubmission],
                                ["Allow voice submission", "Good for reading homework.", allowVoiceSubmission, setAllowVoiceSubmission],
                                ["Show everyone's submissions", "Parents can see all submissions for this post, like a group chat.", allowViewAllSubmissions, setAllowViewAllSubmissions]
                            ].map(([t, d, v, set], i, arr) => (
                                <Box
                                    key={t}
                                    sx={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, py: 1.25,
                                        borderBottom: i === arr.length - 1 ? "none" : "1px solid var(--sl-border)"
                                    }}
                                >
                                    <Box sx={{ minWidth: 0 }}>
                                        <Typography sx={{ fontWeight: 700, fontSize: "0.88rem" }}>{t}</Typography>
                                        <Typography sx={{ color: "text.secondary", fontSize: "0.76rem" }}>{d}</Typography>
                                    </Box>
                                    <Switch checked={v} onChange={(e) => set(e.target.checked)} />
                                </Box>
                            ))}
                        </Box>
                    </Box>
                ) : (
                    <>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(3, 1fr)" }, gap: 1, mb: 2 }}>
                            <Box sx={{ p: 1.25, borderRadius: 2.5, border: "1px solid var(--sl-border)", bgcolor: "var(--sl-soft)" }}>
                                <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 700 }}>HOMEWORK DATE</Typography>
                                <Typography sx={{ fontWeight: 800 }}>{post.homework_date ? post.homework_date.slice(0, 10) : "-"}</Typography>
                            </Box>
                            <Box sx={{ p: 1.25, borderRadius: 2.5, border: "1px solid var(--sl-border)", bgcolor: "var(--sl-soft)" }}>
                                <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 700 }}>DUE DATE</Typography>
                                <Typography sx={{ fontWeight: 800 }}>{post.due_date ? post.due_date.slice(0, 10) : "-"}</Typography>
                                {dueInfo && <Typography sx={{ fontSize: "0.74rem", fontWeight: 700, color: dueInfo.color }}>{dueInfo.text}</Typography>}
                            </Box>
                            <Box sx={{ p: 1.25, borderRadius: 2.5, border: "1px solid var(--sl-border)", bgcolor: "var(--sl-soft)", gridColumn: { xs: "1 / -1", sm: "auto" } }}>
                                <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", fontWeight: 700 }}>PRIORITY</Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                    <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: prioColor }} />
                                    <Typography sx={{ fontWeight: 800 }}>{prio}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Typography sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word", mb: 2 }}>
                            {post.description || "No description."}
                        </Typography>

                        {(post.allow_photo_submission || post.allow_voice_submission || post.allow_view_all_submissions) && (
                            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                                {post.allow_photo_submission && <Chip size="small" variant="outlined" label="Photo submission on" sx={{ fontWeight: 700, border: "1.5px solid var(--sl-ink)" }} />}
                                {post.allow_voice_submission && <Chip size="small" variant="outlined" label="Voice submission on" sx={{ fontWeight: 700, border: "1.5px solid var(--sl-ink)" }} />}
                                {post.allow_view_all_submissions && <Chip size="small" variant="outlined" label="Shared view on" sx={{ fontWeight: 700, border: "1.5px solid var(--sl-ink)" }} />}
                            </Box>
                        )}
                    </>
                )}

                <Box sx={{ mt: 2.5 }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)", mb: 1 }}>
                        Images {editing && `(optional, up to ${MAX_IMAGES})`}
                    </Typography>
                    {images.length === 0 && !editing && (
                        <Typography sx={{ color: "text.secondary", fontSize: "0.85rem" }}>No images attached.</Typography>
                    )}
                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: editing ? 1.5 : 0 }}>
                        {images.map((img, i) => (
                            <Box key={i} sx={{ position: "relative" }}>
                                <Box component="a" href={resolveFileUrl(img.url)} target="_blank" rel="noopener noreferrer">
                                    <Box
                                        component="img"
                                        src={resolveFileUrl(img.url)}
                                        sx={{ width: 104, height: 104, objectFit: "cover", borderRadius: 2, border: "1.5px solid var(--sl-ink)", display: "block" }}
                                    />
                                </Box>
                                {editing && (
                                    <Button
                                        aria-label="Remove image"
                                        onClick={() => handleRemoveImage(i)}
                                        sx={{
                                            position: "absolute", top: -8, right: -8, minWidth: "auto", width: 24, height: 24,
                                            borderRadius: "50%", bgcolor: "var(--sl-ink)", color: "white", fontSize: "0.65rem", p: 0,
                                            "&:hover": { bgcolor: "#DC2626" }
                                        }}
                                    >
                                        ✕
                                    </Button>
                                )}
                            </Box>
                        ))}
                    </Box>
                    {editing && images.length < MAX_IMAGES && (
                        <Button
                            component="label"
                            variant="outlined"
                            startIcon={uploadingImages ? <CircularProgress size={16} /> : <ImageIcon />}
                            disabled={uploadingImages}
                        >
                            {uploadingImages ? "Uploading..." : "Add Image"}
                            <input type="file" hidden multiple accept="image/jpeg,image/png,image/webp" onChange={handleImageSelect} />
                        </Button>
                    )}
                </Box>

                {post.voice_note_url && (
                    <Box sx={{ mt: 2.5 }}>
                        <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)", mb: 1 }}>🎤 Voice note</Typography>
                        <audio controls src={resolveFileUrl(post.voice_note_url)} style={{ height: 36, maxWidth: "100%" }} />
                    </Box>
                )}

                {editing && (
                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 3.5 }}>
                        <Button onClick={() => { setEditing(false); loadPost(); }}>Cancel</Button>
                        <Button
                            loading={saving}
                            loadingPosition="start"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={() => setConfirmSave(true)}
                            disabled={saving}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </Box>
                )}
            </Card>
            <ConfirmDialog
                open={confirmSave}
                title="Save changes?"
                message="This post will be updated."
                confirmLabel="Yes, save"
                onConfirm={() => { setConfirmSave(false); handleSave(); }}
                onCancel={() => setConfirmSave(false)}
            />
        </Box>
    );
}

export default TeacherPostDetailPage;
