import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import CampaignIcon from "@mui/icons-material/CampaignOutlined";

import { createAnnouncement } from "../../services/postService";

import SchoolDatePicker from "../../components/common/SchoolDatePicker";

const audiences = ["All", "Teachers", "Parents", "Students", "School Admin"];

function CreateAnnouncementPage() {

    const navigate = useNavigate();

    const [title, setTitle] = useState("");

    const [description, setDescription] = useState("");

    const [targetAudience, setTargetAudience] = useState("All");

    const [publishDate, setPublishDate] = useState(
        new Date().toISOString().slice(0, 10)
    );

    const [expiryDate, setExpiryDate] = useState("");

    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    async function handleSubmit() {

        setError("");

        setSuccess("");

        if (!title || !description || !publishDate) {

            setError("Please fill in Title, Description and Publish Date.");

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

                is_active: true

            });

            if (response.success) {

                setSuccess("Announcement published successfully.");

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

    return (

        <Box sx={{ maxWidth: 640 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>

                <Box

                    sx={{

                        width: 40,

                        height: 40,

                        borderRadius: "10px",

                        bgcolor: "#EDE9FE",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center"

                    }}

                >

                    <CampaignIcon sx={{ color: "#7C3AED" }} />

                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>

                    Create Announcement

                </Typography>

            </Box>

            <Card sx={{ p: 3.5 }}>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>

                    {error && <Alert severity="error">{error}</Alert>}

                    {success && <Alert severity="success">{success}</Alert>}

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
                        minRows={3}
                        fullWidth
                    />

                    <TextField
                        select
                        label="Target Audience"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        fullWidth
                        helperText={

                            targetAudience === "All"
                                ? "Acknowledgement tracking is available for 'All'."
                                : "Acknowledgement tracking isn't tracked per-student for this audience."

                        }
                    >

                        {audiences.map((a) => (

                            <MenuItem key={a} value={a}>{a}</MenuItem>

                        ))}

                    </TextField>

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

                    <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2 }}>

                        <Button
                            variant="outlined"
                            onClick={() => navigate("/dashboard")}
                        >

                            Cancel

                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={submitting}
                        >

                            {submitting ? "Publishing..." : "Publish Announcement"}

                        </Button>

                    </Box>

                </Box>

            </Card>

        </Box>

    );

}

export default CreateAnnouncementPage;
