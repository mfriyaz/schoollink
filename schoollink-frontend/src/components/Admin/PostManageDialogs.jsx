import { useEffect, useRef, useState } from "react";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    FormControlLabel,
    IconButton,
    MenuItem,
    Switch,
    TextField,
    Typography
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import AddPhotoIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFileOutlined";
import { resolveFileUrl } from "../../config";
import SchoolDatePicker from "../common/SchoolDatePicker";
import {
    getAnnouncementById,
    updateAnnouncement,
    deleteAnnouncement,
    getHomeworkById,
    updateHomeworkPost,
    uploadAttachment
} from "../../services/postService";

const audiences = ["All", "Teachers", "Parents", "Students", "School Admin"];
const MAX_IMAGES = 3;

function day(value) {
    return value ? String(value).slice(0, 10) : "";
}

function prettyDay(value) {
    const d = day(value);
    if (!d) return "-";
    return new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric"
    });
}

function Row({ label, children }) {
    return (
        <Box sx={{ display: "flex", gap: 2, py: 0.75 }}>
            <Typography sx={{ color: "#64748B", fontSize: "0.82rem", minWidth: 110 }}>
                {label}
            </Typography>
            <Box sx={{ fontSize: "0.88rem", fontWeight: 600, minWidth: 0 }}>
                {children}
            </Box>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* View dialog                                                         */
/* ------------------------------------------------------------------ */

export function PostViewDialog({ open, post, onClose, onEdit, onDeleted }) {

    const [record, setRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const isAnnouncement = post?.post_type === "announcement";

    useEffect(() => {

        if (!open || !post) return;

        let cancelled = false;

        async function load() {
            setLoading(true);
            setError("");
            setRecord(null);
            setConfirmDelete(false);

            try {
                const response = isAnnouncement
                    ? await getAnnouncementById(post.id)
                    : await getHomeworkById(post.id);

                if (cancelled) return;

                if (response.success) {
                    setRecord(response.data);
                } else {
                    setError(response.message || "Unable to load this post.");
                }
            } catch (err) {
                if (!cancelled) {
                    setError(err.response?.data?.message || "Unable to load this post.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        load();

        return () => { cancelled = true; };

    }, [open, post, isAnnouncement]);

    async function handleDelete() {
        try {
            setDeleting(true);
            setError("");
            const response = await deleteAnnouncement(post.id);
            if (response.success) {
                onDeleted();
            } else {
                setError(response.message || "Unable to delete.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to delete this announcement.");
        } finally {
            setDeleting(false);
        }
    }

    const images = record?.image_urls || [];

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 1,
                    px: 3,
                    pt: 2.5
                }}
            >
                <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: "flex", gap: 1, mb: 0.75, flexWrap: "wrap" }}>
                        <Chip
                            size="small"
                            label={isAnnouncement ? "Announcement" : "Homework"}
                            sx={{
                                bgcolor: isAnnouncement ? "#FCE7F3" : "#DBEAFE",
                                color: isAnnouncement ? "#BE185D" : "#1D4ED8"
                            }}
                        />
                        {isAnnouncement && record && (
                            <Chip
                                size="small"
                                label={record.is_active ? "Active" : "Hidden"}
                                sx={{
                                    bgcolor: record.is_active ? "#DCFCE7" : "#F1F5F9",
                                    color: record.is_active ? "#15803D" : "#64748B"
                                }}
                            />
                        )}
                    </Box>

                    <Typography sx={{ fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.3 }}>
                        {record?.title || post?.title}
                    </Typography>
                </Box>

                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent sx={{ pt: 2 }}>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress size={28} />
                    </Box>
                )}

                {!loading && record && (
                    <>
                        <Typography sx={{ color: "#334155", whiteSpace: "pre-line", mb: 2 }}>
                            {record.description || "No description."}
                        </Typography>

                        {images.length > 0 && (
                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
                                {images.map((url, i) => (
                                    <Box
                                        key={i}
                                        component="a"
                                        href={resolveFileUrl(url)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ display: "block", width: images.length === 1 ? "100%" : "calc(50% - 6px)" }}
                                    >
                                        <Box
                                            component="img"
                                            src={resolveFileUrl(url)}
                                            sx={{
                                                width: "100%",
                                                maxHeight: 280,
                                                objectFit: "contain",
                                                bgcolor: "#F8FAFC",
                                                borderRadius: 2,
                                                border: "1px solid #E2E8F0",
                                                display: "block"
                                            }}
                                        />
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {record.attachment_url && (
                            <Box
                                component="a"
                                href={resolveFileUrl(record.attachment_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 2,
                                    px: 1.5,
                                    py: 0.75,
                                    borderRadius: 2,
                                    bgcolor: "#F1F5F9",
                                    color: "#2563EB",
                                    textDecoration: "none",
                                    fontSize: "0.85rem",
                                    fontWeight: 600
                                }}
                            >
                                <InsertDriveFileIcon fontSize="small" />
                                Open attachment
                            </Box>
                        )}

                        {record.voice_note_url && (
                            <Box sx={{ mb: 2 }}>
                                <audio controls src={resolveFileUrl(record.voice_note_url)} style={{ width: "100%", height: 38 }} />
                            </Box>
                        )}

                        <Box sx={{ borderTop: "1px solid #F1F5F9", pt: 1 }}>

                            {isAnnouncement ? (
                                <>
                                    <Row label="Shared with">{record.target_audience}</Row>
                                    <Row label="Publish date">{prettyDay(record.publish_date)}</Row>
                                    <Row label="Expiry date">{record.expiry_date ? prettyDay(record.expiry_date) : "No expiry"}</Row>
                                </>
                            ) : (
                                <>
                                    <Row label="Class">
                                        {post.class_name} - {post.section_name} · {post.subject_name}
                                    </Row>
                                    <Row label="Homework date">{prettyDay(record.homework_date)}</Row>
                                    <Row label="Due date">{prettyDay(record.due_date)}</Row>
                                </>
                            )}

                            {post.total_students !== null && post.total_students !== undefined && (
                                <Row label="Acknowledged">
                                    {post.acknowledged_count} of {post.total_students} · {post.pending_count} pending
                                </Row>
                            )}

                        </Box>
                    </>
                )}

                {confirmDelete && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                        Delete this announcement permanently? Parents and teachers will no longer see it.
                        To hide it without deleting, use Edit and turn off Active.
                    </Alert>
                )}

            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5, justifyContent: isAnnouncement ? "space-between" : "flex-end" }}>

                {isAnnouncement && (
                    confirmDelete ? (
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <Button size="small" onClick={() => setConfirmDelete(false)}>
                                Keep
                            </Button>
                            <Button
                                size="small"
                                color="error"
                                variant="contained"
                                onClick={handleDelete}
                                disabled={deleting}
                            >
                                {deleting ? "Deleting..." : "Yes, delete"}
                            </Button>
                        </Box>
                    ) : (
                        <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => setConfirmDelete(true)}
                            disabled={!record}
                        >
                            Delete
                        </Button>
                    )
                )}

                <Box sx={{ display: "flex", gap: 1 }}>
                    <Button variant="outlined" onClick={onClose}>
                        Close
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<EditIcon />}
                        onClick={() => onEdit(record)}
                        disabled={!record}
                    >
                        Edit
                    </Button>
                </Box>

            </DialogActions>

        </Dialog>
    );
}

/* ------------------------------------------------------------------ */
/* Edit dialog                                                         */
/* ------------------------------------------------------------------ */

export function PostEditDialog({ open, post, record, onClose, onSaved }) {

    const fileInputRef = useRef(null);

    const isAnnouncement = post?.post_type === "announcement";

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [audience, setAudience] = useState("All");
    const [publishDate, setPublishDate] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [homeworkDate, setHomeworkDate] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [images, setImages] = useState([]);

    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {

        if (!open || !record) return;

        setTitle(record.title || "");
        setDescription(record.description || "");
        setAudience(record.target_audience || "All");
        setPublishDate(day(record.publish_date));
        setExpiryDate(day(record.expiry_date));
        setIsActive(record.is_active !== false);
        setHomeworkDate(day(record.homework_date));
        setDueDate(day(record.due_date));
        setImages(record.image_urls || []);
        setError("");

    }, [open, record]);

    async function handleImages(e) {

        const files = Array.from(e.target.files || []);
        e.target.value = "";

        if (files.length === 0) return;

        if (images.length + files.length > MAX_IMAGES) {
            setError(`You can add up to ${MAX_IMAGES} images.`);
            return;
        }

        try {
            setUploading(true);
            setError("");

            const added = [];

            for (const file of files) {
                const response = await uploadAttachment(file);
                if (response.success) {
                    added.push(response.data.url);
                } else {
                    setError(response.message);
                    break;
                }
            }

            setImages((prev) => [...prev, ...added]);

        } catch (err) {
            setError(err.response?.data?.message || "Unable to upload this image.");
        } finally {
            setUploading(false);
        }
    }

    async function handleSave() {

        setError("");

        if (!title.trim()) {
            setError("Title is required.");
            return;
        }

        if (isAnnouncement && (!description.trim() || !publishDate)) {
            setError("Description and Publish Date are required.");
            return;
        }

        try {
            setSaving(true);

            let response;

            if (isAnnouncement) {
                response = await updateAnnouncement(post.id, {
                    title,
                    description,
                    target_audience: audience,
                    publish_date: publishDate,
                    expiry_date: expiryDate || null,
                    is_active: isActive,
                    image_urls: images
                });
            } else {
                // Homework: keep its attachment and photos exactly as they are
                response = await updateHomeworkPost(post.id, {
                    title,
                    description,
                    homework_date: homeworkDate,
                    due_date: dueDate,
                    attachment_url: record.attachment_url,
                    image_urls: record.image_urls || []
                });
            }

            if (response.success) {
                onSaved();
            } else {
                setError(response.message || "Unable to save changes.");
            }

        } catch (err) {
            setError(err.response?.data?.message || "Unable to save changes.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 3, pt: 2.5 }}>
                <Typography sx={{ fontWeight: 700, fontSize: "1.15rem" }}>
                    Edit {isAnnouncement ? "announcement" : "homework post"}
                </Typography>
                <IconButton size="small" onClick={onClose}>
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>

            <DialogContent>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: 1 }}>

                    {error && <Alert severity="error">{error}</Alert>}

                    <TextField
                        label="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                    />

                    {isAnnouncement ? (
                        <>
                            <Box>
                                <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", mb: 1 }}>
                                    Photos (up to {MAX_IMAGES})
                                </Typography>

                                <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>

                                    {images.map((url, i) => (
                                        <Box key={url} sx={{ position: "relative", width: 96, height: 96 }}>
                                            <Box
                                                component="img"
                                                src={resolveFileUrl(url)}
                                                sx={{
                                                    width: "100%",
                                                    height: "100%",
                                                    objectFit: "cover",
                                                    borderRadius: 2,
                                                    border: "1px solid #E2E8F0"
                                                }}
                                            />
                                            <IconButton
                                                size="small"
                                                onClick={() => setImages((prev) => prev.filter((_, idx) => idx !== i))}
                                                sx={{
                                                    position: "absolute",
                                                    top: -8,
                                                    right: -8,
                                                    width: 22,
                                                    height: 22,
                                                    bgcolor: "#0F172A",
                                                    color: "white",
                                                    "&:hover": { bgcolor: "#DC2626" }
                                                }}
                                            >
                                                <CloseIcon sx={{ fontSize: 14 }} />
                                            </IconButton>
                                        </Box>
                                    ))}

                                    {images.length < MAX_IMAGES && (
                                        <Box
                                            onClick={() => !uploading && fileInputRef.current?.click()}
                                            sx={{
                                                width: 96,
                                                height: 96,
                                                borderRadius: 2,
                                                border: "2px dashed #CBD5E1",
                                                display: "flex",
                                                flexDirection: "column",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                gap: 0.5,
                                                color: "#64748B",
                                                cursor: "pointer",
                                                "&:hover": { borderColor: "#2563EB", color: "#2563EB" }
                                            }}
                                        >
                                            {uploading ? (
                                                <CircularProgress size={22} />
                                            ) : (
                                                <>
                                                    <AddPhotoIcon />
                                                    <Typography sx={{ fontSize: "0.72rem", fontWeight: 600 }}>
                                                        Add photo
                                                    </Typography>
                                                </>
                                            )}
                                        </Box>
                                    )}

                                </Box>

                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    hidden
                                    multiple
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImages}
                                />
                            </Box>

                            <TextField
                                select
                                label="Share with"
                                value={audience}
                                onChange={(e) => setAudience(e.target.value)}
                                fullWidth
                            >
                                {audiences.map((a) => (
                                    <MenuItem key={a} value={a}>{a}</MenuItem>
                                ))}
                            </TextField>

                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                                <SchoolDatePicker
                                    label="Publish Date"
                                    value={publishDate}
                                    onChange={setPublishDate}
                                    fullWidth
                                />
                                <SchoolDatePicker
                                    label="Expiry Date (optional)"
                                    value={expiryDate}
                                    onChange={setExpiryDate}
                                    fullWidth
                                />
                            </Box>

                            <FormControlLabel
                                control={<Switch checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />}
                                label={isActive ? "Active: visible to the audience" : "Hidden: not shown to anyone"}
                            />
                        </>
                    ) : (
                        <>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
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
                            </Box>

                            <Typography sx={{ color: "#64748B", fontSize: "0.8rem" }}>
                                The attachment and photos stay as the teacher added them. Changes here do not re-notify parents.
                            </Typography>
                        </>
                    )}

                </Box>

            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button variant="outlined" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleSave} disabled={saving || uploading}>
                    {saving ? "Saving..." : "Save changes"}
                </Button>
            </DialogActions>

        </Dialog>
    );
}
