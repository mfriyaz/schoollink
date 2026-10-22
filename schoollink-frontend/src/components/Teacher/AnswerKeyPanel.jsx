import { useEffect, useState } from "react";
import { Alert, Box, Button, CircularProgress, TextField, Typography } from "@mui/material";
import KeyIcon from "@mui/icons-material/VpnKeyOutlined";
import { getHomeworkAnswerKey, saveHomeworkAnswerKey } from "../../services/postService";
import { notify } from "../../utils/notify";

const pillSx = {
    px: 1.5, py: 0.4, borderRadius: 99, cursor: "pointer", userSelect: "none",
    fontSize: "0.78rem", fontWeight: 800, color: "var(--sl-ink)",
    border: "1.5px solid var(--sl-ink)", bgcolor: "#fff",
    "&:hover": { bgcolor: "var(--sl-soft)" }
};

/**
 * Teacher-only answer key for one homework.
 * Parents never get this: it is loaded from a separate, teacher-only endpoint.
 */
export default function AnswerKeyPanel({ homeworkId }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [key, setKey] = useState(null);
    const [show, setShow] = useState(false);
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let alive = true;
        setLoading(true);
        getHomeworkAnswerKey(homeworkId)
            .then((r) => { if (alive) setKey(r.success ? r.data : null); })
            .catch(() => { if (alive) setError("Could not load the answer key."); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [homeworkId]);

    async function save() {
        setSaving(true);
        try {
            const r = await saveHomeworkAnswerKey(homeworkId, draft);
            if (r.success) {
                setKey(r.data);
                setEditing(false);
                setShow(Boolean(r.data));
                notify(r.data ? "Answer key saved." : "Answer key removed.");
            } else {
                notify(r.message || "Could not save.", "error");
            }
        } catch (err) {
            notify(err.response?.data?.message || "Could not save.", "error");
        } finally {
            setSaving(false);
        }
    }

    async function copy() {
        try {
            await navigator.clipboard.writeText(key.answer_key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) { /* ignore */ }
    }

    return (
        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2.5, border: "1.5px dashed var(--sl-ink)", bgcolor: "var(--sl-soft)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <KeyIcon sx={{ fontSize: 20, color: "var(--sl-ink)" }} />
                <Box sx={{ flex: 1, minWidth: 140 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--sl-ink)" }}>Answer key</Typography>
                    <Typography sx={{ fontSize: "0.74rem", color: "text.secondary" }}>Only you and your school admin can see this. Parents cannot.</Typography>
                </Box>
                {loading && <CircularProgress size={18} />}
                {!loading && !editing && (
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                        {key && <Box role="button" tabIndex={0} onClick={() => setShow((v) => !v)} sx={pillSx}>{show ? "Hide" : "Show"}</Box>}
                        {key && show && <Box role="button" tabIndex={0} onClick={copy} sx={pillSx}>{copied ? "Copied" : "Copy"}</Box>}
                        <Box role="button" tabIndex={0} onClick={() => { setDraft(key ? key.answer_key : ""); setEditing(true); }} sx={pillSx}>
                            {key ? "Edit" : "Add"}
                        </Box>
                    </Box>
                )}
            </Box>

            {error && <Alert severity="warning" sx={{ mt: 1 }}>{error}</Alert>}

            {!loading && !error && !key && !editing && (
                <Typography sx={{ mt: 1, fontSize: "0.85rem", color: "text.secondary" }}>No answer key saved for this homework.</Typography>
            )}

            {key && show && !editing && (
                <>
                    <Typography sx={{ mt: 1, whiteSpace: "pre-wrap", fontSize: "0.9rem" }}>{key.answer_key}</Typography>
                    {key.ai_generated && (
                        <Typography sx={{ mt: 0.75, fontSize: "0.72rem", color: "text.secondary" }}>
                            Written by AI. Please check it against your questions.
                        </Typography>
                    )}
                </>
            )}

            {editing && (
                <Box sx={{ mt: 1.25 }}>
                    <TextField
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        multiline
                        minRows={4}
                        fullWidth
                        inputProps={{ maxLength: 8000 }}
                        placeholder="1. ...&#10;2. ..."
                    />
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Button variant="contained" size="small" onClick={save} disabled={saving}>Save</Button>
                        <Button size="small" onClick={() => setEditing(false)} disabled={saving}>Cancel</Button>
                    </Box>
                    <Typography sx={{ mt: 0.5, fontSize: "0.72rem", color: "text.secondary" }}>Leave it empty and save to remove the answer key.</Typography>
                </Box>
            )}
        </Box>
    );
}
