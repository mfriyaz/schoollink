import { useEffect, useState } from "react";

import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    DialogTitle, Divider, ListSubheader, Menu, MenuItem, TextField, Tooltip, Typography
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";

import { aiImprove, aiTranslate, getAiStatus } from "../../services/aiService";

const ACTIONS = [
    { id: "improve", label: "Improve writing" },
    { id: "grammar", label: "Fix spelling and grammar" },
    { id: "shorten", label: "Make shorter" },
    { id: "lengthen", label: "Make longer" },
    { id: "friendly", label: "Friendly tone" },
    { id: "formal", label: "Formal tone" },
];

/**
 * "AI assist" button for a text field.
 *   value    current text of the field
 *   onApply  called with the new text
 * Hidden completely when AI is off for the school or not set up on the server.
 */
export default function AiAssistButton({ value, onApply }) {

    const [status, setStatus] = useState(null);
    const [anchor, setAnchor] = useState(null);
    const [dialog, setDialog] = useState(null); // { title, loading, text, error }

    useEffect(() => {
        let alive = true;
        getAiStatus()
            .then((r) => { if (alive) setStatus(r.data); })
            .catch(() => { if (alive) setStatus(null); });
        return () => { alive = false; };
    }, []);

    if (!status || !status.available || (status.features && status.features.writing === false)) return null;

    const empty = !String(value || "").trim();
    const noneLeft = status.remaining <= 0;

    async function run(title, fn) {
        setAnchor(null);
        setDialog({ title, loading: true, text: "", error: "" });
        try {
            const r = await fn();
            setStatus((s) => ({ ...s, remaining: r.data.remaining, used: s.limit - r.data.remaining }));
            setDialog({ title, loading: false, text: r.data.text, error: "", retry: fn });
        } catch (err) {
            setDialog({
                title, loading: false, text: "", retry: fn,
                error: err.response?.data?.message || "Unable to reach the AI. Please try again."
            });
        }
    }

    const doAction = (a) => run(a.label, () => aiImprove(a.id, value));
    const doTranslate = (l) => run(`Translate to ${l.name}`, () => aiTranslate(l.code, value));

    function apply(mode) {
        const t = dialog.text.trim();
        if (!t) return;
        onApply(mode === "append" && !empty ? `${String(value).trimEnd()}\n\n${t}` : t);
        setDialog(null);
    }

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -1.5 }}>
                <Tooltip title={noneLeft ? "This month's AI limit is used up" : "Improve or translate this message with AI"}>
                    <span>
                        <Button
                            size="small"
                            startIcon={<AutoAwesomeIcon />}
                            onClick={(e) => setAnchor(e.currentTarget)}
                            disabled={noneLeft}
                            sx={{ fontWeight: 700 }}
                        >
                            AI assist
                        </Button>
                    </span>
                </Tooltip>
            </Box>

            <Menu
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                slotProps={{ paper: { sx: { maxHeight: 420, minWidth: 220 } } }}
            >
                {empty && (
                    <Typography sx={{ px: 2, py: 1, fontSize: "0.8rem", color: "text.secondary", maxWidth: 240 }}>
                        Type a few words in the message first, then choose an action.
                    </Typography>
                )}
                <ListSubheader sx={{ lineHeight: "30px" }}>Rewrite</ListSubheader>
                {ACTIONS.map((a) => (
                    <MenuItem key={a.id} disabled={empty} onClick={() => doAction(a)}>{a.label}</MenuItem>
                ))}
                <Divider />
                <ListSubheader sx={{ lineHeight: "30px" }}>Translate to</ListSubheader>
                {status.languages.map((l) => (
                    <MenuItem key={l.code} disabled={empty} onClick={() => doTranslate(l)}>{l.name}</MenuItem>
                ))}
                <Divider />
                <Typography sx={{ px: 2, py: 0.75, fontSize: "0.72rem", color: "text.secondary" }}>
                    {status.remaining} AI uses left this month
                </Typography>
            </Menu>

            <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
                {dialog && (
                    <>
                        <DialogTitle sx={{ fontWeight: 800 }}>{dialog.title}</DialogTitle>
                        <DialogContent>
                            {dialog.loading && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 3 }}>
                                    <CircularProgress size={22} />
                                    <Typography>Writing...</Typography>
                                </Box>
                            )}
                            {dialog.error && <Alert severity="error" sx={{ mt: 1 }}>{dialog.error}</Alert>}
                            {!dialog.loading && !dialog.error && (
                                <>
                                    <TextField
                                        value={dialog.text}
                                        onChange={(e) => setDialog({ ...dialog, text: e.target.value })}
                                        multiline
                                        minRows={5}
                                        fullWidth
                                        sx={{ mt: 1 }}
                                    />
                                    <Typography sx={{ fontSize: "0.75rem", color: "text.secondary", mt: 1 }}>
                                        Written by AI. Please read it and fix anything before you post. You can edit it here.
                                    </Typography>
                                </>
                            )}
                        </DialogContent>
                        <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
                            <Button onClick={() => setDialog(null)}>Cancel</Button>
                            {!dialog.loading && dialog.retry && (
                                <Button onClick={() => run(dialog.title, dialog.retry)}>Try again</Button>
                            )}
                            {!dialog.loading && !dialog.error && (
                                <>
                                    <Button variant="outlined" onClick={() => apply("append")}>Add below</Button>
                                    <Button variant="contained" onClick={() => apply("replace")}>Use this</Button>
                                </>
                            )}
                        </DialogActions>
                    </>
                )}
            </Dialog>
        </>
    );
}
