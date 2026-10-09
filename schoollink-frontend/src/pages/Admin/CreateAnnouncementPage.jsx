import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    IconButton,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import AddPhotoIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";

import { createAnnouncement, uploadAttachment } from "../../services/postService";
import { resolveFileUrl } from "../../config";
import SchoolDatePicker from "../../components/common/SchoolDatePicker";

const audiences = ["All", "Teachers", "Parents", "Students", "School Admin"];

const MAX_IMAGES = 3;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 10;

function CreateAnnouncementPage() {

    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [targetAudience, setTargetAudience] = useState("All");

    const [publishDate, setPublishDate] = useState(
        new Date().toISOString().slice(0, 10)
    );

    const [expiryDate, setExpiryDate] = useState("");

    const [images, setImages] = useState([]);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [imageError, setImageError] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    async function handleImagesSelected(e) {

        const files = Array.from(e.target.files || []);

        e.target.value = "";

        if (files.length === 0) {
            return;
        }

        setImageError("");

        if (images.length + files.length > MAX_IMAGES) {
            setImageError(`You can add up to ${MAX_IMAGES} images.`);
            return;
        }

        for (const file of files) {

            if (!ALLOWED_TYPES.includes(file.type)) {
                setImageError("Only JPG, PNG or WebP images are allowed.");
                return;
            }

            if (file.size > MAX_SIZE_MB * 1024 * 1024) {
                setImageError(`Each image must be under ${MAX_SIZE_MB}MB.`);
                return;
            }
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
        }
    }

    function removeImage(index) {
        setImages((prev) => prev.filter((_, i) => i !== index));
    }

    async function handleSubmit() {

        setError("");
        setSuccess("");

        if (!title || !description || !publishDate) {
            setError("Please fill in Title, Description and Publish Date.");
            return;
        }

        if (uploadingImages) {
            setError("Please wait for the images to finish uploading.");
            return;
        }

        try {

            setSubmitting(true);

            const response = await createAnnouncement({
                title,
                description,
                target_audience: targetAudience,
                publish_date: publishDate,
                expiry_date: expiryDate || null,
                is_active: true,
                image_urls: images.map((img) => img.url)
            });

            if (response.success) {

                setSuccess("Announcement published and shared.");

                setTimeout(() => {
                    navigate("/dashboard");
                }, 900);

            } else {

                setError(response.message);
            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to publish this announcement."
            );

        } finally {

            setSubmitting(false);
        }
    }

    const hasContent = title || description || images.length > 0;

    return (

        <Box sx={{ maxWidth: 1000 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>

                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "10px",
                        bgcolor: "#FCE7F3",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <CampaignIcon sx={{ color: "#DB2777" }} />
                </Box>

                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: { xs: "1.3rem", md: "1.5rem" }, lineHeight: 1.2 }}>
                        Create Announcement
                    </Typography>
                    <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                        Share news, achievements and notices with everyone.
                    </Typography>
                </Box>

            </Box>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", md: "minmax(0, 3fr) minmax(0, 2fr)" },
                    gap: 3,
                    alignItems: "start"
                }}
            >

                {/* ---------- Form ---------- */}
                <Card
                    sx={{
                        p: { xs: 2, md: 3 },
                        borderRadius: 3,
                        border: "1px solid #EEF2F7",
                        boxShadow: "0 1px 3px rgba(15,23,42,.06)"
                    }}
                >

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                        {error && <Alert severity="error">{error}</Alert>}
                        {success && <Alert severity="success">{success}</Alert>}

                        <TextField
                            label="Title"
                            placeholder="e.g. Inter-school Science Quiz Winners"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            fullWidth
                        />

                        <TextField
                            label="Description"
                            placeholder="Write the message parents should see"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            multiline
                            minRows={4}
                            fullWidth
                        />

                        {/* ---------- Images ---------- */}
                        <Box>

                            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem", mb: 0.25 }}>
                                Photos (optional)
                            </Typography>

                            <Typography sx={{ color: "#64748B", fontSize: "0.8rem", mb: 1.25 }}>
                                Add up to {MAX_IMAGES} images, such as a competition award or event photo.
                            </Typography>

                            {imageError && (
                                <Alert severity="error" sx={{ mb: 1.5 }}>
                                    {imageError}
                                </Alert>
                            )}

                            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>

                                {images.map((img, i) => (

                                    <Box
                                        key={img.url}
                                        sx={{
                                            position: "relative",
                                            width: 110,
                                            height: 110
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={resolveFileUrl(img.url)}
                                            alt={img.name}
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
                                            onClick={() => removeImage(i)}
                                            sx={{
                                                position: "absolute",
                                                top: -8,
                                                right: -8,
                                                bgcolor: "#0F172A",
                                                color: "white",
                                                width: 22,
                                                height: 22,
                                                "&:hover": { bgcolor: "#DC2626" }
                                            }}
                                        >
                                            <CloseIcon sx={{ fontSize: 14 }} />
                                        </IconButton>
                                    </Box>
                                ))}

                                {images.length < MAX_IMAGES && (

                                    <Box
                                        onClick={() => !uploadingImages && fileInputRef.current?.click()}
                                        sx={{
                                            width: 110,
                                            height: 110,
                                            borderRadius: 2,
                                            border: "2px dashed #CBD5E1",
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            gap: 0.5,
                                            color: "#64748B",
                                            cursor: uploadingImages ? "default" : "pointer",
                                            "&:hover": { borderColor: "#2563EB", color: "#2563EB", bgcolor: "#F8FAFC" }
                                        }}
                                    >
                                        {uploadingImages ? (
                                            <CircularProgress size={24} />
                                        ) : (
                                            <>
                                                <AddPhotoIcon />
                                                <Typography sx={{ fontSize: "0.75rem", fontWeight: 600 }}>
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
                                accept="image/jpeg,image/png,image/webp"
                                multiple
                                hidden
                                onChange={handleImagesSelected}
                            />

                        </Box>

                        <TextField
                            select
                            label="Share with"
                            value={targetAudience}
                            onChange={(e) => setTargetAudience(e.target.value)}
                            fullWidth
                            helperText={
                                targetAudience === "All"
                                    ? "Everyone in the school. Parents are notified and can acknowledge."
                                    : "Acknowledgement tracking isn't tracked per-student for this audience."
                            }
                        >
                            {audiences.map((a) => (
                                <MenuItem key={a} value={a}>{a}</MenuItem>
                            ))}
                        </TextField>

                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                gap: 2
                            }}
                        >
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

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>

                            <Button
                                variant="outlined"
                                onClick={() => navigate("/dashboard")}
                            >
                                Cancel
                            </Button>

                            <Button
                                variant="contained"
                                onClick={handleSubmit}
                                disabled={submitting || uploadingImages}
                            >
                                {submitting ? "Publishing..." : "Publish & Share"}
                            </Button>

                        </Box>

                    </Box>

                </Card>

                {/* ---------- Live preview ---------- */}
                <Box sx={{ position: { md: "sticky" }, top: { md: 16 } }}>

                    <Typography
                        sx={{
                            color: "#64748B",
                            fontSize: "0.74rem",
                            fontWeight: 700,
                            letterSpacing: 0.6,
                            textTransform: "uppercase",
                            mb: 1
                        }}
                    >
                        Preview: how parents will see it
                    </Typography>

                    <Card
                        sx={{
                            borderRadius: 3,
                            border: "1px solid #EEF2F7",
                            boxShadow: "0 1px 3px rgba(15,23,42,.06)",
                            overflow: "hidden"
                        }}
                    >

                        {images.length > 0 && (
                            <Box
                                component="img"
                                src={resolveFileUrl(images[0].url)}
                                alt=""
                                sx={{
                                    width: "100%",
                                    maxHeight: 240,
                                    objectFit: "cover",
                                    display: "block"
                                }}
                            />
                        )}

                        <Box sx={{ p: 2.25 }}>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                                <Chip
                                    size="small"
                                    label="Announcement"
                                    sx={{ height: 22, fontSize: "0.72rem", fontWeight: 600, bgcolor: "#FCE7F3", color: "#BE185D" }}
                                />
                                <Typography sx={{ color: "#94A3B8", fontSize: "0.74rem" }}>
                                    {targetAudience}
                                </Typography>
                            </Box>

                            {hasContent ? (
                                <>
                                    <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.3 }}>
                                        {title || "Your title"}
                                    </Typography>

                                    <Typography
                                        sx={{
                                            color: "#475569",
                                            fontSize: "0.88rem",
                                            mt: 0.75,
                                            whiteSpace: "pre-line"
                                        }}
                                    >
                                        {description || "Your message will appear here."}
                                    </Typography>

                                    {images.length > 1 && (
                                        <Typography sx={{ color: "#94A3B8", fontSize: "0.76rem", mt: 1.25 }}>
                                            + {images.length - 1} more photo{images.length > 2 ? "s" : ""}
                                        </Typography>
                                    )}
                                </>
                            ) : (
                                <Typography sx={{ color: "#94A3B8", fontSize: "0.88rem", py: 2 }}>
                                    Start typing and add a photo to see the preview.
                                </Typography>
                            )}

                        </Box>

                    </Card>

                </Box>

            </Box>

        </Box>
    );
}

export default CreateAnnouncementPage;
