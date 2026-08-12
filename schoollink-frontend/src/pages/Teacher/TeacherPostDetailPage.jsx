import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import EditIcon from "@mui/icons-material/EditOutlined";
import SaveIcon from "@mui/icons-material/SaveOutlined";
import ImageIcon from "@mui/icons-material/ImageOutlined";

import {
    getHomeworkById,
    updateHomeworkPost,
    uploadAttachment
} from "../../services/postService";

import { resolveFileUrl } from "../../config";
import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";

const priorities = ["Low", "Normal", "High"];

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

    const [images, setImages] = useState([]);

    const [uploadingImages, setUploadingImages] = useState(false);

    const [saving, setSaving] = useState(false);

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

                image_urls: images.map((img) => img.url)

            });

            if (response.success) {

                setPost(response.data);

                setSaveSuccess("Post updated successfully!");

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

    return (

        <Box sx={{ maxWidth: 700 }}>

            <Box
                onClick={() => navigate("/teacher/posts")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", cursor: "pointer", mb: 2, width: "fit-content" }}
            >

                <ArrowBackIcon fontSize="small" />

                <Typography sx={{ fontSize: "0.9rem" }}>Back to Posts</Typography>

            </Box>

            <Card sx={{ p: 3.5 }}>

                {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

                {saveSuccess && <Alert severity="success" sx={{ mb: 2 }}>{saveSuccess}</Alert>}

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2, flexWrap: "wrap", gap: 1.5 }}>

                    {editing ? (

                        <TextField
                            label="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                        />

                    ) : (

                        <Typography variant="h5" sx={{ fontWeight: 700 }}>

                            {post.title}

                        </Typography>

                    )}

                    {!editing && (

                        <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => setEditing(true)}
                        >

                            Edit

                        </Button>

                    )}

                </Box>

                <Typography sx={{ color: "#94A3B8", fontSize: "0.82rem", mb: 3 }}>

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

                        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>

                            <TextField
                                select
                                label="Priority"
                                value={priority}
                                onChange={(e) => setPriority(e.target.value)}
                                sx={{ minWidth: 150 }}
                            >

                                {priorities.map((p) => (

                                    <MenuItem key={p} value={p}>{p}</MenuItem>

                                ))}

                            </TextField>

                            <TextField
                                label="Homework Date"
                                type="date"
                                value={homeworkDate}
                                onChange={(e) => setHomeworkDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />

                            <TextField
                                label="Due Date"
                                type="date"
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />

                        </Box>

                    </Box>

                ) : (

                    <Typography sx={{ whiteSpace: "pre-wrap", mb: 3 }}>

                        {post.description || "No description."}

                    </Typography>

                )}

                {!editing && (

                    <Box sx={{ display: "flex", gap: 2, mt: 3, flexWrap: "wrap" }}>

                        <Chip size="small" label={`Priority: ${post.priority}`} />

                        <Chip
                            size="small"
                            label={`Homework: ${post.homework_date ? post.homework_date.slice(0, 10) : "-"}`}
                        />

                        <Chip
                            size="small"
                            label={`Due: ${post.due_date ? post.due_date.slice(0, 10) : "-"}`}
                        />

                    </Box>

                )}

                <Box sx={{ mt: 3 }}>

                    <Typography sx={{ fontSize: "0.85rem", color: "#334155", mb: 1, fontWeight: 500 }}>

                        Images {editing && `(optional, up to ${MAX_IMAGES})`}

                    </Typography>

                    {images.length === 0 && !editing && (

                        <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>

                            No images attached.

                        </Typography>

                    )}

                    <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: editing ? 1.5 : 0 }}>

                        {images.map((img, i) => (

                            <Box key={i} sx={{ position: "relative" }}>

                                <Box
                                    component="a"
                                    href={resolveFileUrl(img.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >

                                    <Box

                                        component="img"

                                        src={resolveFileUrl(img.url)}

                                        sx={{

                                            width: 100,

                                            height: 100,

                                            objectFit: "cover",

                                            borderRadius: 2,

                                            border: "1px solid #E2E8F0",

                                            display: "block"

                                        }}

                                    />

                                </Box>

                                {editing && (

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

                {post.voice_note_url && (

                    <Box sx={{ mt: 3 }}>

                        <Typography sx={{ fontSize: "0.85rem", color: "#334155", mb: 1, fontWeight: 500 }}>

                            🎤 Voice Note

                        </Typography>

                        <audio controls src={resolveFileUrl(post.voice_note_url)} style={{ height: 36 }} />

                    </Box>

                )}

                {editing && (

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, mt: 4 }}>

                        <Button
                            onClick={() => {

                                setEditing(false);

                                loadPost();

                            }}
                        >

                            Cancel

                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                        >

                            {saving ? "Saving..." : "Save Changes"}

                        </Button>

                    </Box>

                )}

            </Card>

        </Box>

    );

}

export default TeacherPostDetailPage;
