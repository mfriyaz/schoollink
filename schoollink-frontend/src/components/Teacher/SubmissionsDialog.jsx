import { useEffect, useState } from "react";

import {
    Box,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Tooltip,
    Typography
} from "@mui/material";

import CloseIcon from "@mui/icons-material/CloseOutlined";

import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";

import {
    getSubmissionsByHomework,
    reactToSubmission
} from "../../services/homeworkSubmissionService";

import { resolveFileUrl } from "../../config";

const REACTIONS = [

    { key: "thumbs_up", emoji: "👍", label: "Thumbs Up" },

    { key: "heart", emoji: "❤️", label: "Heart" },

    { key: "star", emoji: "🌟", label: "Star" }

];

function SubmissionsDialog({ open, post, onClose }) {

    const [submissions, setSubmissions] = useState([]);

    const [loading, setLoading] = useState(true);

    const [reactingId, setReactingId] = useState(null);

    useEffect(() => {

        if (open && post) {

            loadSubmissions();

        }

    }, [open, post]);

    async function loadSubmissions() {

        try {

            setLoading(true);

            const response = await getSubmissionsByHomework(post.id);

            if (response.success) {

                setSubmissions(response.data);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    async function handleReact(submissionId, reactionKey) {

        try {

            setReactingId(submissionId);

            const response = await reactToSubmission(submissionId, reactionKey, post.id);

            if (response.success) {

                setSubmissions((prev) =>
                    prev.map((s) => (s.id === submissionId ? response.data : s))
                );

            }

        } catch (err) {

            console.error(err);

        } finally {

            setReactingId(null);

        }

    }

    if (!post) {

        return null;

    }

    return (

        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                <Box>

                    <Typography sx={{ fontWeight: 700 }}>

                        Submitted Work

                    </Typography>

                    <Typography sx={{ color: "#64748B", fontSize: "0.82rem", fontWeight: 400 }}>

                        {post.title}

                    </Typography>

                </Box>

                <IconButton onClick={onClose} size="small">

                    <CloseIcon fontSize="small" />

                </IconButton>

            </DialogTitle>

            <DialogContent>

                {loading && (

                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>

                        <CircularProgress size={28} />

                    </Box>

                )}

                {!loading && submissions.length === 0 && (

                    <Typography color="text.secondary">

                        No submissions yet.

                    </Typography>

                )}

                {!loading && submissions.map((submission) => (

                    <Box

                        key={submission.id}

                        sx={{

                            py: 2,

                            borderBottom: "1px solid #F1F5F9",

                            "&:last-of-type": { borderBottom: "none" }

                        }}

                    >

                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>

                            <Typography sx={{ fontWeight: 600 }}>

                                {submission.first_name} {submission.last_name}

                            </Typography>

                            <Box sx={{ display: "flex", gap: 0.75 }}>

                                {REACTIONS.map((r) => {

                                    const selected = submission.reaction === r.key;

                                    return (

                                        <Tooltip key={r.key} title={r.label}>

                                            <Box

                                                component="button"

                                                onClick={() => handleReact(submission.id, r.key)}

                                                disabled={reactingId === submission.id}

                                                sx={{

                                                    width: 40,

                                                    height: 40,

                                                    display: "flex",

                                                    alignItems: "center",

                                                    justifyContent: "center",

                                                    fontSize: "1.4rem",

                                                    lineHeight: 1,

                                                    borderRadius: "50%",

                                                    cursor: "pointer",

                                                    filter: "none",

                                                    opacity: reactingId === submission.id ? 0.5 : 1,

                                                    bgcolor: selected ? "#DCFCE7" : "#F8FAFC",

                                                    border: selected ? "2px solid #16A34A" : "2px solid transparent",

                                                    transform: selected ? "scale(1.15)" : "scale(1)",

                                                    transition: "all .15s ease",

                                                    "&:hover": {

                                                        bgcolor: "#DCFCE7",

                                                        transform: "scale(1.15)"

                                                    }

                                                }}

                                            >

                                                {r.emoji}

                                            </Box>

                                        </Tooltip>

                                    );

                                })}

                            </Box>

                        </Box>

                        <Typography sx={{ color: "#94A3B8", fontSize: "0.78rem", mb: 1 }}>

                            Submitted {toUtcDate(submission.submitted_at).toLocaleString(undefined, { timeZone: getSchoolTimezone() })}

                            {submission.photo_urls && submission.photo_urls.length > 0 &&
                                ` · ${submission.photo_urls.length} photo${submission.photo_urls.length !== 1 ? "s" : ""}`}

                            {submission.voice_url && " · Voice recording"}

                            {submission.reviewed_at && " · Reviewed"}

                        </Typography>

                        {submission.voice_url && (

                            <Box sx={{ mb: 1.5 }}>

                                <audio controls src={resolveFileUrl(submission.voice_url)} style={{ height: 36, maxWidth: 280 }} />

                            </Box>

                        )}

                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>

                            {submission.photo_urls && submission.photo_urls.map((url, i) => (

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

                                            width: 110,

                                            height: 110,

                                            objectFit: "cover",

                                            borderRadius: 2,

                                            border: "1px solid #E2E8F0",

                                            display: "block"

                                        }}

                                    />

                                </Box>

                            ))}

                        </Box>

                    </Box>

                ))}

            </DialogContent>

        </Dialog>

    );

}

export default SubmissionsDialog;
