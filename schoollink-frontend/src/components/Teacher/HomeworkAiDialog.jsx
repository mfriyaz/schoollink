import { useEffect, useState } from "react";
import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    MenuItem, TextField, Typography
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import DialogHeader from "../common/DialogHeader";
import { AI_LANGUAGES, pickLanguages } from "../common/AiAssistButton";
import { aiHomeworkDraft, getAiStatus } from "../../services/aiService";

const DIFFICULTY = [
    { id: "easy", label: "Easy" },
    { id: "medium", label: "Standard" },
    { id: "hard", label: "Challenge" }
];

const TYPES = [
    { id: "mixed", label: "Mixed" },
    { id: "short", label: "Short answer" },
    { id: "mcq", label: "Multiple choice" },
    { id: "fill", label: "Fill in the blanks" },
    { id: "word", label: "Word problems" }
];

const CURRICULUM_KEY = "sl_hw_curriculum";

function readCurriculum() {
    try { return localStorage.getItem(CURRICULUM_KEY) || ""; } catch (e) { return ""; }
}

const pillSx = (on) => ({
    px: 1.5, py: 0.55, borderRadius: 99, cursor: "pointer", userSelect: "none",
    fontSize: "0.82rem", fontWeight: 700, color: "var(--sl-ink)",
    border: "1.5px solid var(--sl-ink)",
    bgcolor: on ? "var(--sl-accent)" : "transparent",
    "&:hover": { bgcolor: on ? "var(--sl-accent)" : "var(--sl-soft)" }
});

function Label({ children }) {
    return (
        <Typography sx={{ fontSize: "0.78rem", fontWeight: 800, color: "var(--sl-ink)", mb: 0.75 }}>
            {children}
        </Typography>
    );
}

/**
 * "Create with AI" for teachers: asks a few questions, shows a draft
 * (title, instructions, questions) plus a teacher-only answer key.
 * Nothing is saved or posted: "Use this" only fills the form.
 *   assignment  the chosen class/subject ({ teacher_subject_id, class_name, subject_name })
 *   onUse       called with { title, description }
 * Hidden completely when the feature is off or AI is not set up.
 */
export default function HomeworkAiButton({ assignment, onUse }) {
    const [status, setStatus] = useState(null);
    const [open, setOpen] = useState(false);
    const [topic, setTopic] = useState("");
    const [difficulty, setDifficulty] = useState("medium");
    const [qtype, setQtype] = useState("mixed");
    const [count, setCount] = useState(8);
    const [language, setLanguage] = useState("en");
    const [curriculum, setCurriculum] = useState(readCurriculum);
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [draft, setDraft] = useState(null);
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        let alive = true;
        getAiStatus()
            .then((r) => { if (alive) setStatus(r.data); })
            .catch(() => { if (alive) setStatus(null); });
        return () => { alive = false; };
    }, []);

    if (!status || !status.available || (status.features && status.features.homework_generator === false)) return null;

    const noneLeft = status.remaining <= 0;

    async function generate() {
        if (!assignment) { setError("Choose the class and subject first."); return; }
        if (!topic.trim()) { setError("Please enter the topic."); return; }
        setError("");
        setLoading(true);
        setShowKey(false);
        try {
            try { localStorage.setItem(CURRICULUM_KEY, curriculum); } catch (e) { /* ignore */ }
            const r = await aiHomeworkDraft({
                teacher_subject_id: assignment.teacher_subject_id,
                topic, difficulty, question_type: qtype, count: Number(count), language, curriculum, notes
            });
            setStatus((s) => ({ ...s, remaining: r.data.remaining, used: s.limit - r.data.remaining }));
            setDraft({
                title: r.data.title,
                instructions: r.data.instructions,
                questions: r.data.questions,
                answer_key: r.data.answer_key
            });
        } catch (err) {
            setError(err.response?.data?.message || "Unable to reach the AI. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function use() {
        if (!draft) return;
        onUse({
            title: draft.title,
            description: `${draft.instructions.trim()}\n\n${draft.questions.trim()}`
        });
        setOpen(false);
        setDraft(null);
    }

    async function copyKey() {
        try {
            await navigator.clipboard.writeText(draft.answer_key);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (e) { /* ignore */ }
    }

    const langs = pickLanguages(status.languages);

    return (
        <>
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -1.5 }}>
                <Box
                    role="button"
                    tabIndex={0}
                    aria-disabled={noneLeft}
                    title={noneLeft ? "This month's AI limit is used up" : "Let AI draft the homework for you"}
                    onClick={() => { if (!noneLeft) { setOpen(true); setError(""); } }}
                    sx={{ ...pillSx(true), display: "inline-flex", alignItems: "center", gap: 0.75, boxShadow: "2px 2px 0 var(--sl-ink)", opacity: noneLeft ? 0.4 : 1 }}
                >
                    <AutoAwesomeIcon sx={{ fontSize: 17 }} />
                    Create homework with AI
                </Box>
            </Box>

            <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
                <DialogHeader
                    icon={<AutoAwesomeIcon />}
                    title="Create homework with AI"
                    subtitle={assignment ? `${assignment.class_name} · ${assignment.subject_name}` : "Choose class and subject first"}
                    onClose={() => setOpen(false)}
                />
                <DialogContent>
                    {!draft && !loading && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1.25 }}>
                            <TextField
                                label="Topic"
                                placeholder="e.g. Algebra, Fractions, Parts of a plant"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                inputProps={{ maxLength: 200 }}
                                fullWidth
                            />
                            <Box>
                                <Label>Level</Label>
                                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                                    {DIFFICULTY.map((d) => (
                                        <Box key={d.id} role="button" tabIndex={0} onClick={() => setDifficulty(d.id)} sx={pillSx(difficulty === d.id)}>{d.label}</Box>
                                    ))}
                                </Box>
                            </Box>
                            <Box>
                                <Label>Question style</Label>
                                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                                    {TYPES.map((t) => (
                                        <Box key={t.id} role="button" tabIndex={0} onClick={() => setQtype(t.id)} sx={pillSx(qtype === t.id)}>{t.label}</Box>
                                    ))}
                                </Box>
                            </Box>
                            <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                                <TextField select label="Questions" value={count} onChange={(e) => setCount(e.target.value)}>
                                    {[3, 5, 8, 10, 12, 15].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                                </TextField>
                                <TextField select label="Language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                                    {(langs.length ? langs : AI_LANGUAGES).map((l) => <MenuItem key={l.code} value={l.code}>{l.native}</MenuItem>)}
                                </TextField>
                            </Box>
                            <TextField
                                label="Curriculum or board (optional)"
                                placeholder="e.g. CBSE, ICSE, Tamil Nadu State Board"
                                value={curriculum}
                                onChange={(e) => setCurriculum(e.target.value)}
                                inputProps={{ maxLength: 60 }}
                                fullWidth
                            />
                            <TextField
                                label="Anything else? (optional)"
                                placeholder="e.g. include 2 word problems about money"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                inputProps={{ maxLength: 300 }}
                                fullWidth
                            />
                        </Box>
                    )}

                    {loading && (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 4 }}>
                            <CircularProgress size={22} />
                            <Typography sx={{ fontWeight: 600 }}>Writing your homework...</Typography>
                        </Box>
                    )}

                    {error && <Alert severity="error" sx={{ mt: 1.5 }}>{error}</Alert>}

                    {draft && !loading && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1.25 }}>
                            <TextField label="Title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} fullWidth />
                            <TextField label="Instructions" value={draft.instructions} onChange={(e) => setDraft({ ...draft, instructions: e.target.value })} multiline fullWidth />
                            <TextField label="Questions" value={draft.questions} onChange={(e) => setDraft({ ...draft, questions: e.target.value })} multiline minRows={6} fullWidth />
                            <Box sx={{ p: 1.5, borderRadius: 2.5, border: "1.5px dashed var(--sl-ink)", bgcolor: "var(--sl-soft)" }}>
                                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: "0.85rem" }}>Answer key (only you see this)</Typography>
                                    <Box sx={{ display: "flex", gap: 0.75 }}>
                                        <Box role="button" tabIndex={0} onClick={() => setShowKey((v) => !v)} sx={pillSx(false)}>{showKey ? "Hide" : "Show"}</Box>
                                        {showKey && <Box role="button" tabIndex={0} onClick={copyKey} sx={pillSx(false)}>{copied ? "Copied" : "Copy"}</Box>}
                                    </Box>
                                </Box>
                                {showKey && (
                                    <Typography sx={{ mt: 1, whiteSpace: "pre-wrap", fontSize: "0.88rem" }}>{draft.answer_key}</Typography>
                                )}
                                <Typography sx={{ mt: 0.75, fontSize: "0.74rem", color: "text.secondary" }}>
                                    The answer key is not posted and is not saved. Copy it now if you want to keep it.
                                </Typography>
                            </Box>
                            <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
                                Written by AI. Please check every question and answer before you post. {status.remaining} AI uses left this month.
                            </Typography>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
                    <Button onClick={() => setOpen(false)}>Cancel</Button>
                    {!draft && !loading && (
                        <Button variant="contained" onClick={generate} disabled={!assignment}>Write homework</Button>
                    )}
                    {draft && !loading && (
                        <>
                            <Button variant="outlined" onClick={() => { setDraft(null); setError(""); }}>Change settings</Button>
                            <Button variant="outlined" onClick={generate}>Write again</Button>
                            <Button variant="contained" onClick={use}>Use this homework</Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>
        </>
    );
}
