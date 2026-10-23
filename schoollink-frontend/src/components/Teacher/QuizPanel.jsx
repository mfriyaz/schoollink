import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import ConfirmDialog from "../common/ConfirmDialog";
import { getQuizForManage, getQuizResults, removeQuiz } from "../../services/quizService";
import { notify } from "../../utils/notify";

const pillSx = {
    px: 1.5, py: 0.4, borderRadius: 99, cursor: "pointer", userSelect: "none",
    fontSize: "0.78rem", fontWeight: 800, color: "var(--sl-ink)",
    border: "1.5px solid var(--sl-ink)", bgcolor: "#fff",
    "&:hover": { bgcolor: "var(--sl-soft)" }
};

const LETTERS = ["A", "B", "C", "D"];

/**
 * Teacher / admin view of the practice quiz on one homework (with the correct answers).
 * Shows nothing when the homework has no quiz.
 */
export default function QuizPanel({ homeworkId }) {
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [show, setShow] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const [showRes, setShowRes] = useState(false);
    const [results, setResults] = useState(null);
    const [resLoading, setResLoading] = useState(false);
    const [resError, setResError] = useState("");

    useEffect(() => {
        let alive = true;
        setLoading(true);
        getQuizForManage(homeworkId)
            .then((r) => { if (alive) setQuiz(r.success ? r.data : null); })
            .catch(() => { if (alive) setQuiz(null); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [homeworkId]);

    async function toggleResults() {
        const next = !showRes;
        setShowRes(next);
        if (!next) return;
        setResLoading(true);
        setResError("");
        try {
            const r = await getQuizResults(homeworkId);
            if (r.success) setResults(r.data); else setResError(r.message || "Could not load the results.");
        } catch (err) {
            setResError(err.response?.data?.message || "Could not load the results.");
        } finally {
            setResLoading(false);
        }
    }

    async function remove() {
        setBusy(true);
        try {
            const r = await removeQuiz(homeworkId);
            if (r.success) {
                setQuiz(null);
                setConfirm(false);
                notify("Quiz removed.");
            } else {
                notify(r.message || "Could not remove the quiz.", "error");
            }
        } catch (err) {
            notify(err.response?.data?.message || "Could not remove the quiz.", "error");
        } finally {
            setBusy(false);
        }
    }

    if (loading || !quiz) return null;

    return (
        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2.5, border: "1.5px solid var(--sl-ink)", bgcolor: "var(--sl-soft)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <QuizIcon sx={{ fontSize: 22, color: "var(--sl-ink)" }} />
                <Box sx={{ flex: 1, minWidth: 140 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--sl-ink)" }}>Practice quiz</Typography>
                    <Typography sx={{ fontSize: "0.76rem", color: "text.secondary" }}>
                        {quiz.questions.length} questions · {quiz.max_attempts} {quiz.max_attempts === 1 ? "try" : "tries"} per child
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    <Box role="button" tabIndex={0} onClick={toggleResults} sx={pillSx}>{showRes ? "Hide results" : "Results"}</Box>
                    <Box role="button" tabIndex={0} onClick={() => setShow((v) => !v)} sx={pillSx}>{show ? "Hide questions" : "Show questions"}</Box>
                    <Box role="button" tabIndex={0} onClick={() => setConfirm(true)} sx={{ ...pillSx, color: "#B91C1C", borderColor: "#B91C1C" }}>Remove</Box>
                </Box>
            </Box>

            {showRes && (
                <Box sx={{ mt: 1.25, pt: 1, borderTop: "1px solid var(--sl-border)" }}>
                    {resLoading && <CircularProgress size={20} />}
                    {resError && <Typography sx={{ color: "#B91C1C", fontSize: "0.86rem" }}>{resError}</Typography>}
                    {results && !resLoading && (
                        <>
                            <Typography sx={{ fontWeight: 800, fontSize: "0.95rem", color: "var(--sl-ink)" }}>
                                {results.summary.tried} of {results.summary.students} children have tried it
                                {results.summary.average_percent !== null ? ` · class average ${results.summary.average_percent}%` : ""}
                            </Typography>
                            <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", mb: 1 }}>Scores are each child's best try.</Typography>

                            {results.students.length === 0 && (
                                <Typography sx={{ fontSize: "0.86rem", color: "text.secondary" }}>No children found in this class.</Typography>
                            )}

                            {results.students.map((st) => (
                                <Box key={st.id} sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.6, borderTop: "1px solid var(--sl-border)" }}>
                                    <Typography sx={{ flex: 1, minWidth: 0, fontSize: "0.88rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>{st.name}</Typography>
                                    {st.tries === 0 ? (
                                        <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>Not tried</Typography>
                                    ) : (
                                        <>
                                            {st.any_late && <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#9A3412" }}>LATE</Typography>}
                                            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{st.tries} {st.tries === 1 ? "try" : "tries"}</Typography>
                                            <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, minWidth: 44, textAlign: "right", color: st.best.total && st.best.score / st.best.total < 0.5 ? "#B91C1C" : "#15803D" }}>
                                                {st.best.score}/{st.best.total}
                                            </Typography>
                                        </>
                                    )}
                                </Box>
                            ))}

                            {results.summary.tried > 0 && (
                                <Box sx={{ mt: 1.25 }}>
                                    <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--sl-ink)" }}>Questions most missed</Typography>
                                    <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", mb: 0.5 }}>Based on each child's first try.</Typography>
                                    {[...results.questions]
                                        .sort((x, y) => (x.right / (x.total || 1)) - (y.right / (y.total || 1)))
                                        .map((q) => {
                                            const pct = q.total ? Math.round((q.right / q.total) * 100) : 0;
                                            return (
                                                <Box key={q.id} sx={{ py: 0.6, borderTop: "1px solid var(--sl-border)" }}>
                                                    <Typography sx={{ fontSize: "0.84rem" }}>{q.number}. {q.question_text}</Typography>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                                                        <Box sx={{ flex: 1, height: 8, borderRadius: 99, bgcolor: "#fff", border: "1px solid var(--sl-border)", overflow: "hidden" }}>
                                                            <Box sx={{ width: `${pct}%`, height: "100%", bgcolor: pct < 50 ? "#DC2626" : "#16A34A" }} />
                                                        </Box>
                                                        <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, minWidth: 74, textAlign: "right" }}>{q.right} of {q.total} right</Typography>
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                </Box>
                            )}
                        </>
                    )}
                </Box>
            )}

            {show && quiz.questions.map((q, i) => (
                <Box key={q.id} sx={{ mt: 1.25, pt: 1, borderTop: "1px solid var(--sl-border)" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>
                        {i + 1}. {q.question_text}
                        {q.qtype === "tf" ? "  (True / False)" : q.qtype === "fill" ? "  (Fill in the blank)" : ""}
                    </Typography>
                    {q.qtype === "fill"
                        ? (
                            <Typography sx={{ fontSize: "0.86rem", ml: 1.5, fontWeight: 800, color: "#15803D" }}>
                                Accepted: {(q.accepted_answers || []).join("  |  ")}  ✓
                            </Typography>
                        )
                        : q.options.map((o, k) => (
                            <Typography key={k} sx={{ fontSize: "0.86rem", ml: 1.5, fontWeight: k === q.correct_index ? 800 : 400, color: k === q.correct_index ? "#15803D" : "inherit" }}>
                                {q.qtype === "tf" ? o : `${LETTERS[k]}. ${o}`}{k === q.correct_index ? "  ✓" : ""}
                            </Typography>
                        ))}
                    {q.explanation && <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", ml: 1.5 }}>Why: {q.explanation}</Typography>}
                </Box>
            ))}

            <ConfirmDialog
                open={confirm}
                title="Remove this quiz?"
                message="The quiz and every child's results for it will be deleted. The homework itself stays."
                confirmLabel="Remove quiz"
                confirmColor="error"
                busy={busy}
                onConfirm={remove}
                onCancel={() => setConfirm(false)}
            />
        </Box>
    );
}
