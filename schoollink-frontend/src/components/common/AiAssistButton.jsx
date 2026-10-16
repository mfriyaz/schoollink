import { useEffect, useState } from "react";
import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    Popover, TextField, Tooltip, Typography
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import TranslateIcon from "@mui/icons-material/TranslateOutlined";
import DialogHeader from "./DialogHeader";
import { aiImprove, aiTranslate, getAiStatus } from "../../services/aiService";

const ACTIONS = [
    { id: "improve", label: "Improve writing" },
    { id: "grammar", label: "Fix spelling and grammar" },
    { id: "shorten", label: "Make shorter" },
    { id: "lengthen", label: "Make longer" },
    { id: "friendly", label: "Friendly tone" },
    { id: "formal", label: "Formal tone" },
];

// Only these languages are offered (in this order), with their own script.
export const AI_LANGUAGES = [
    { code: "en", name: "English", native: "English" },
    { code: "ta", name: "Tamil", native: "தமிழ்" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "ms", name: "Malay", native: "Bahasa Melayu" },
    { code: "zh", name: "Chinese", native: "中文" },
];

export function pickLanguages(list) {
    const have = new Set((list || []).map((l) => l.code));
    return AI_LANGUAGES.filter((l) => have.has(l.code));
}

const pillSx = (disabled) => ({
    px: 1.5, py: 0.6, borderRadius: 99, cursor: disabled ? "default" : "pointer", userSelect: "none",
    fontSize: "0.82rem", fontWeight: 700, color: "var(--sl-ink)",
    border: "1.5px solid var(--sl-ink)", bgcolor: "transparent",
    opacity: disabled ? 0.4 : 1,
    "&:hover": { bgcolor: disabled ? undefined : "var(--sl-soft)" }
});

function PanelLabel({ icon, children }) {
    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1, color: "var(--sl-ink)" }}>
            {icon}
            <Typography sx={{ fontWeight: 800, fontSize: "0.78rem", letterSpacing: 0.6, textTransform: "uppercase" }}>{children}</Typography>
        </Box>
    );
}

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
                        <Box
                            role="button"
                            tabIndex={0}
                            aria-disabled={noneLeft}
                            onClick={(e) => { if (!noneLeft) setAnchor(e.currentTarget); }}
                            sx={{ ...pillSx(noneLeft), display: "inline-flex", alignItems: "center", gap: 0.75, bgcolor: "var(--sl-accent)", boxShadow: "2px 2px 0 var(--sl-ink)" }}
                        >
                            <AutoAwesomeIcon sx={{ fontSize: 17 }} />
                            AI assist
                        </Box>
                    </span>
                </Tooltip>
            </Box>
            <Popover
                anchorEl={anchor}
                open={Boolean(anchor)}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { sx: { p: 2, mt: 1, width: { xs: "calc(100vw - 32px)", sm: 400 }, maxWidth: 420, borderRadius: 3, border: "1.5px solid var(--sl-ink)", boxShadow: "4px 4px 0 var(--sl-ink)" } } }}
            >
                {empty && (
                    <Alert severity="info" sx={{ mb: 1.5, py: 0 }}>
                        Type a few words in the message first, then choose an action.
                    </Alert>
                )}
                <PanelLabel icon={<AutoAwesomeIcon sx={{ fontSize: 17 }} />}>Rewrite</PanelLabel>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 2 }}>
                    {ACTIONS.map((a) => (
                        <Box key={a.id} role="button" tabIndex={0} aria-disabled={empty}
                            onClick={() => { if (!empty) doAction(a); }} sx={pillSx(empty)}>
                            {a.label}
                        </Box>
                    ))}
                </Box>
                <PanelLabel icon={<TranslateIcon sx={{ fontSize: 17 }} />}>Translate to</PanelLabel>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75 }}>
                    {pickLanguages(status.languages).map((l) => (
                        <Box key={l.code} role="button" tabIndex={0} aria-disabled={empty}
                            onClick={() => { if (!empty) doTranslate(l); }}
                            sx={{ ...pillSx(empty), bgcolor: "var(--sl-soft)", display: "flex", flexDirection: "column", alignItems: "center", lineHeight: 1.2, minWidth: 84 }}>
                            <span>{l.native}</span>
                            {l.native !== l.name && <Box component="span" sx={{ fontSize: "0.68rem", fontWeight: 600, opacity: 0.7 }}>{l.name}</Box>}
                        </Box>
                    ))}
                </Box>
                <Typography sx={{ mt: 2, fontSize: "0.74rem", color: "text.secondary" }}>
                    {status.remaining} AI uses left this month
                </Typography>
            </Popover>
            <Dialog open={Boolean(dialog)} onClose={() => setDialog(null)} fullWidth maxWidth="sm">
                {dialog && (
                    <>
                        <DialogHeader icon={dialog.title.startsWith("Translate") ? <TranslateIcon /> : <AutoAwesomeIcon />} title={dialog.title} subtitle="Review before you use it" onClose={() => setDialog(null)} />
                        <DialogContent>
                            {dialog.loading && (
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 3 }}>
                                    <CircularProgress size={22} />
                                    <Typography sx={{ fontWeight: 600 }}>Writing...</Typography>
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
