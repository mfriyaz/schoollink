import { useEffect, useState } from "react";
import {
    Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent,
    MenuItem, Radio, TextField, Typography
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
    { id: "word", label: "Word problems" },
    { id: "quiz", label: "Quiz: multiple choice" },
    { id: "quizmix", label: "Quiz: mixed types" }
];

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
 *   onUse       called with { title, description, answer_key }
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
    const [curriculum, setCurriculum] = useState("");
    const [notes, setNotes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [draft, setDraft] = useState(null);
    const [showKey, setShowKey] = useState(false);
    const [copied, setCopied] = useState(false);
    const [maxAttempts, setMaxAttempts] = useState(2);

    useEffect(() => {
        let alive = true;
        getAiStatus()
            .then((r) => { if (alive) { setStatus(r.data); setCurriculum(r.data.curriculum || ""); } })
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
            const r = await aiHomeworkDraft({
                teacher_subject_id: assignment.teacher_subject_id,
                topic, difficulty, question_type: qtype === "quizmix" ? "quiz" : qtype, quiz_mix: qtype === "quizmix" ? "mixed" : undefined, count: Number(count), language, curriculum, notes
            });
            setStatus((s) => ({ ...s, remaining: r.data.remaining, used: s.limit - r.data.remaining }));
            setDraft({
                title: r.data.title,
                instructions: r.data.instructions,
                questions: r.data.questions,
                answer_key: r.data.answer_key,
                quiz: r.data.quiz ? r.data.quiz.questions : null
            });
        } catch (err) {
            setError(err.response?.data?.message || "Unable to reach the AI. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function setQ(i, patch) {
        setDraft((d) => ({ ...d, quiz: d.quiz.map((q, k) => (k === i ? { ...q, ...patch } : q)) }));
    }

    function setOpt(i, k, value) {
        setDraft((d) => ({
            ...d,
            quiz: d.quiz.map((q, n) => (n === i ? { ...q, options: q.options.map((o, m) => (m === k ? value : o)) } : q))
        }));
    }

    function changeType(i, qtype) {
        const base = qtype === "mcq"
            ? { options: ["", "", "", ""], correct_index: 0, accepted_answers: undefined }
            : qtype === "tf"
                ? { options: ["True", "False"], correct_index: 0, accepted_answers: undefined }
                : { options: [], correct_index: 0, accepted_answers: [""] };
        setQ(i, { qtype, ...base });
    }

    function addQuestion(qtype) {
        const q = { question_text: "", explanation: "", qtype };
        const base = qtype === "mcq"
            ? { options: ["", "", "", ""], correct_index: 0 }
            : qtype === "tf"
                ? { options: ["True", "False"], correct_index: 0 }
                : { options: [], correct_index: 0, accepted_answers: [""] };
        setDraft((d) => ({ ...d, quiz: [...d.quiz, { ...q, ...base }] }));
    }

    function setAccepted(i, k, value) {
        setDraft((d) => ({
            ...d,
            quiz: d.quiz.map((q, n) => (n === i ? { ...q, accepted_answers: q.accepted_answers.map((a, m) => (m === k ? value : a)) } : q))
        }));
    }

    function use() {
        if (!draft) return;
        if (draft.quiz) {
            for (let i = 0; i < draft.quiz.length; i++) {
                const q = draft.quiz[i];
                const kind = q.qtype || "mcq";
                if (!q.question_text.trim()) {
                    setError(`Question ${i + 1} is empty.`);
                    return;
                }
                if (kind === "fill") {
                    if (!(q.accepted_answers || []).some((x) => x.trim())) {
                        setError(`Question ${i + 1} needs at least one accepted answer.`);
                        return;
                    }
                } else if (kind === "mcq") {
                    const opts = q.options.map((o) => o.trim());
                    if (opts.some((o) => !o)) {
                        setError(`Question ${i + 1} needs its text and four answer options.`);
                        return;
                    }
                    if (new Set(opts.map((o) => o.toLowerCase())).size !== 4) {
                        setError(`Question ${i + 1} has two options that are the same.`);
                        return;
                    }
                }
            }
            if (!draft.quiz.length) {
                setError("Add at least one question.");
                return;
            }
            setError("");
            onUse({
                title: draft.title,
                description: `${draft.instructions.trim()}\n\nThis is a practice quiz. Open this homework in the app and choose the answers.`,
                quiz: { questions: draft.quiz.map((q) => (q.qtype === "fill" ? { ...q, accepted_answers: (q.accepted_answers || []).map((x) => x.trim()).filter(Boolean) } : q)), max_attempts: Number(maxAttempts) }
            });
            setOpen(false);
            setDraft(null);
            return;
        }
        onUse({
            title: draft.title,
            description: `${draft.instructions.trim()}\n\n${draft.questions.trim()}`,
            answer_key: draft.answer_key
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
                                label="Curriculum or board"
                                placeholder="e.g. CBSE, ICSE, Tamil Nadu State Board"
                                helperText={status.curriculum && curriculum === status.curriculum ? "Set by your school. You can change it for this homework." : "Optional"}
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
                            {draft.quiz && (
                                <>
                                    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                                        Check each question. Tap the round button to choose the correct answer, or type the accepted answers for a fill-in-the-blank. Children only see the right answers after they have tried.
                                    </Typography>
                                    {draft.quiz.map((q, i) => (
                                        <Box key={i} sx={{ p: 1.5, borderRadius: 2.5, border: "1.5px solid var(--sl-ink)" }}>
                                            <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
                                                <TextField label={`Question ${i + 1}`} value={q.question_text} onChange={(e) => setQ(i, { question_text: e.target.value })} multiline fullWidth size="small" />
                                                <Box role="button" tabIndex={0} aria-label="Remove question" onClick={() => setDraft((d) => ({ ...d, quiz: d.quiz.filter((_, k) => k !== i) }))} sx={{ ...pillSx(false), mt: 0.5, whiteSpace: "nowrap" }}>Remove</Box>
                                            </Box>
                                            <Box sx={{ display: "flex", gap: 0.75, mt: 1, flexWrap: "wrap" }}>
                                                {[["mcq", "Multiple choice"], ["tf", "True / False"], ["fill", "Fill in the blank"]].map(([id, label]) => (
                                                    <Box key={id} role="button" tabIndex={0} onClick={() => { if ((q.qtype || "mcq") !== id) changeType(i, id); }} sx={pillSx((q.qtype || "mcq") === id)}>{label}</Box>
                                                ))}
                                            </Box>
                                            {(q.qtype || "mcq") === "mcq" && q.options.map((o, k) => (
                                                <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.75 }}>
                                                    <Radio checked={q.correct_index === k} onChange={() => setQ(i, { correct_index: k })} sx={{ color: "var(--sl-ink)", "&.Mui-checked": { color: "#16A34A" }, p: 0.75 }} inputProps={{ "aria-label": `Option ${k + 1} is correct` }} />
                                                    <TextField value={o} onChange={(e) => setOpt(i, k, e.target.value)} fullWidth size="small" />
                                                </Box>
                                            ))}
                                            {q.qtype === "tf" && ["True", "False"].map((o, k) => (
                                                <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.5 }}>
                                                    <Radio checked={q.correct_index === k} onChange={() => setQ(i, { correct_index: k })} sx={{ color: "var(--sl-ink)", "&.Mui-checked": { color: "#16A34A" }, p: 0.75 }} inputProps={{ "aria-label": `${o} is the correct answer` }} />
                                                    <Typography sx={{ fontSize: "0.92rem" }}>{o}</Typography>
                                                </Box>
                                            ))}
                                            {q.qtype === "fill" && (
                                                <Box sx={{ mt: 1 }}>
                                                    <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mb: 0.5 }}>
                                                        Answers you will accept (capital letters and spaces do not matter):
                                                    </Typography>
                                                    {(q.accepted_answers || [""]).map((a, k) => (
                                                        <TextField key={k} value={a} onChange={(e) => setAccepted(i, k, e.target.value)} placeholder={k === 0 ? "Correct answer" : "Another accepted answer"} inputProps={{ maxLength: 100, "aria-label": `Accepted answer ${k + 1}` }} fullWidth size="small" sx={{ mb: 0.75 }} />
                                                    ))}
                                                    {(q.accepted_answers || []).length < 5 && (
                                                        <Box role="button" tabIndex={0} onClick={() => setQ(i, { accepted_answers: [...(q.accepted_answers || []), ""] })} sx={{ ...pillSx(false), display: "inline-block" }}>+ Add another accepted answer</Box>
                                                    )}
                                                </Box>
                                            )}
                                            <TextField label="Why (shown after they try)" value={q.explanation || ""} onChange={(e) => setQ(i, { explanation: e.target.value })} fullWidth size="small" sx={{ mt: 1 }} />
                                        </Box>
                                    ))}
                                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", alignItems: "center" }}>
                                        <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>Add a question:</Typography>
                                        {[["mcq", "Multiple choice"], ["tf", "True / False"], ["fill", "Fill in the blank"]].map(([id, label]) => (
                                            <Box key={id} role="button" tabIndex={0} onClick={() => addQuestion(id)} sx={pillSx(false)}>{label}</Box>
                                        ))}
                                    </Box>
                                    <TextField select label="Tries allowed per child" value={maxAttempts} onChange={(e) => setMaxAttempts(e.target.value)} size="small">
                                        {[1, 2, 3, 5].map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                                    </TextField>
                                </>
                            )}
                            {!draft.quiz && (
                            <TextField label="Questions" value={draft.questions} onChange={(e) => setDraft({ ...draft, questions: e.target.value })} multiline minRows={6} fullWidth />
                            )}
                            {!draft.quiz && (
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
                                    The answer key is not posted to parents. It is saved for you only and you can open it later on the homework page.
                                </Typography>
                            </Box>
                            )}
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
