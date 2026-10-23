import { useEffect, useState } from "react";
import { Alert, Box, Button, Card, Radio, TextField, Typography } from "@mui/material";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import CheckIcon from "@mui/icons-material/CheckCircleRounded";
import CloseIcon from "@mui/icons-material/CancelRounded";
import { getQuizForStudent, submitQuizAttempt } from "../../services/quizService";

const LETTERS = ["A", "B", "C", "D"];

const pillSx = {
    px: 1.75, py: 0.6, borderRadius: 99, cursor: "pointer", userSelect: "none",
    fontSize: "0.85rem", fontWeight: 800, color: "var(--sl-ink)",
    border: "1.5px solid var(--sl-ink)", bgcolor: "var(--sl-accent)",
    boxShadow: "2px 2px 0 var(--sl-ink)", display: "inline-flex", alignItems: "center"
};

/**
 * Practice quiz on a homework, for the child (through the parent's login).
 * The questions come without the right answers: marking happens on the server.
 * Shows nothing at all when the homework has no quiz.
 */
export default function QuizCard({ homeworkId, studentId }) {
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [taking, setTaking] = useState(false);
    const [answers, setAnswers] = useState({});
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;
        setLoading(true);
        getQuizForStudent(homeworkId, studentId)
            .then((r) => { if (alive) setQuiz(r.success ? r.data : null); })
            .catch(() => { if (alive) setQuiz(null); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [homeworkId, studentId]);

    if (loading) return null;
    if (!quiz) return null;

    const canTry = quiz.open && quiz.attempts_left > 0;
    const answered = Object.keys(answers).length;

    async function submit() {
        setBusy(true);
        setError("");
        try {
            const r = await submitQuizAttempt(homeworkId, studentId, answers);
            if (r.success) {
                setQuiz(r.data);
                setTaking(false);
                setAnswers({});
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                setError(r.message || "Could not hand in the quiz.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Could not hand in the quiz.");
        } finally {
            setBusy(false);
        }
    }

    const review = quiz.review;

    return (
        <Card sx={{ p: { xs: 2, md: 2.5 }, mt: 2.5, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 1.5 }}>
                <Box sx={{ width: 38, height: 38, minWidth: 38, borderRadius: "12px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <QuizIcon sx={{ color: "var(--sl-ink)", fontSize: 22 }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--sl-ink)" }}>Practice quiz</Typography>
                    <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                        {quiz.question_count} questions · {quiz.attempts_left} of {quiz.max_attempts} tries left
                        {quiz.best ? ` · Best score ${quiz.best.score}/${quiz.best.total}` : ""}
                    </Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

            {!taking && review && (
                <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ p: 1.5, borderRadius: 2.5, border: "1.5px solid var(--sl-ink)", bgcolor: "#DCFCE7", mb: 1.5 }}>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.2rem", color: "#14532D" }}>
                            Last try: {review.score} out of {review.total}
                        </Typography>
                        {quiz.attempts[quiz.attempts.length - 1]?.is_late && (
                            <Typography sx={{ fontSize: "0.78rem", color: "#9A3412", fontWeight: 700 }}>Handed in late</Typography>
                        )}
                    </Box>
                    {quiz.questions.map((q, i) => {
                        const it = review.items.find((x) => x.question_id === q.id);
                        if (!it) return null;
                        const right = it.correct === true;
                        const isFill = q.qtype === "fill";
                        const shown = it.chosen === null || it.chosen === "" ? "no answer" : (isFill ? it.chosen : q.options[it.chosen]);
                        return (
                            <Box key={q.id} sx={{ py: 1.25, borderTop: "1px solid var(--sl-border)" }}>
                                <Box sx={{ display: "flex", gap: 0.75, alignItems: "flex-start" }}>
                                    {right
                                        ? <CheckIcon sx={{ color: "#16A34A", fontSize: 22, mt: 0.1 }} />
                                        : <CloseIcon sx={{ color: "#DC2626", fontSize: 22, mt: 0.1 }} />}
                                    <Typography sx={{ fontWeight: 700 }}>{i + 1}. {q.question_text}</Typography>
                                </Box>
                                <Typography sx={{ ml: 3.5, fontSize: "0.86rem", color: right ? "#15803D" : "#B91C1C" }}>
                                    Your answer: {shown}
                                </Typography>
                                {!right && (
                                    <Typography sx={{ ml: 3.5, fontSize: "0.86rem", color: "#15803D", fontWeight: 700 }}>
                                        Correct answer: {isFill ? it.correct_text : q.options[it.correct_index]}
                                    </Typography>
                                )}
                                {it.explanation && (
                                    <Typography sx={{ ml: 3.5, fontSize: "0.82rem", color: "text.secondary" }}>{it.explanation}</Typography>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            )}

            {!taking && !review && !canTry && (
                <Alert severity="info">This quiz is closed. Please ask the teacher if you still need to try it.</Alert>
            )}

            {!taking && canTry && (
                <Box
                    role="button"
                    tabIndex={0}
                    onClick={() => { setTaking(true); setAnswers({}); setError(""); }}
                    sx={pillSx}
                >
                    {review ? "Try again" : "Start the quiz"}
                </Box>
            )}

            {!taking && review && !canTry && (
                <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                    {quiz.open ? "You have used all your tries." : "This quiz is closed now."}
                </Typography>
            )}

            {taking && (
                <Box>
                    {quiz.past_due && (
                        <Alert severity="warning" sx={{ mb: 1.5 }}>The due date has passed. This try will be marked Late.</Alert>
                    )}
                    {quiz.questions.map((q, i) => (
                        <Box key={q.id} sx={{ py: 1.25, borderTop: i ? "1px solid var(--sl-border)" : "none" }}>
                            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>{i + 1}. {q.question_text}</Typography>
                            {q.qtype === "fill" ? (
                                <TextField
                                    value={answers[q.id] || ""}
                                    onChange={(e) => {
                                        const v = e.target.value;
                                        const next = { ...answers };
                                        if (v.trim()) next[q.id] = v; else delete next[q.id];
                                        setAnswers(next);
                                    }}
                                    placeholder="Type your answer"
                                    inputProps={{ maxLength: 100, "aria-label": `Answer to question ${i + 1}` }}
                                    fullWidth
                                    size="small"
                                />
                            ) : q.options.map((o, k) => {
                                const on = answers[q.id] === k;
                                return (
                                    <Box
                                        key={k}
                                        role="radio"
                                        aria-checked={on}
                                        tabIndex={0}
                                        onClick={() => setAnswers({ ...answers, [q.id]: k })}
                                        onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); setAnswers({ ...answers, [q.id]: k }); } }}
                                        sx={{
                                            display: "flex", alignItems: "center", gap: 0.5, py: 0.25, pr: 1.25, mb: 0.75,
                                            borderRadius: 2.5, cursor: "pointer",
                                            border: "1.5px solid", borderColor: on ? "var(--sl-ink)" : "var(--sl-border)",
                                            bgcolor: on ? "var(--sl-soft)" : "transparent"
                                        }}
                                    >
                                        <Radio checked={on} tabIndex={-1} sx={{ color: "var(--sl-ink)", "&.Mui-checked": { color: "var(--sl-ink)" } }} />
                                        <Typography sx={{ fontSize: "0.92rem" }}>{q.qtype === "tf" ? <b>{o}</b> : <><b>{LETTERS[k]}.</b> {o}</>}</Typography>
                                    </Box>
                                );
                            })}
                        </Box>
                    ))}
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", mb: 1 }}>
                        {answered} of {quiz.question_count} answered. Unanswered questions count as wrong.
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button variant="contained" onClick={submit} disabled={busy || answered === 0}>
                            {busy ? "Marking..." : "Hand in"}
                        </Button>
                        <Button onClick={() => setTaking(false)} disabled={busy}>Cancel</Button>
                    </Box>
                </Box>
            )}
        </Card>
    );
}
