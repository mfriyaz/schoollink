import { useEffect, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, TextField, Typography } from "@mui/material";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import ConfirmDialog from "../common/ConfirmDialog";
import DialogHeader from "../common/DialogHeader";
import { useNavigate } from "react-router-dom";
import { getQuizForManage, removeQuiz, setQuizClosed } from "../../services/quizService";
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
export default function QuizPanel({ homeworkId, onChange }) {
    const [loading, setLoading] = useState(true);
    const [quiz, setQuiz] = useState(null);
    const [show, setShow] = useState(false);
    const [confirm, setConfirm] = useState(false);
    const [busy, setBusy] = useState(false);
    const [typed, setTyped] = useState("");
    const [confirmClose, setConfirmClose] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        let alive = true;
        setLoading(true);
        getQuizForManage(homeworkId)
            .then((r) => { if (alive) { setQuiz(r.success ? r.data : null); if (onChange) onChange(Boolean(r.success && r.data)); } })
            .catch(() => { if (alive) { setQuiz(null); if (onChange) onChange(false); } })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [homeworkId]);

    async function remove() {
        setBusy(true);
        try {
            const r = await removeQuiz(homeworkId, typed);
            if (r.success) {
                setQuiz(null);
                if (onChange) onChange(false);
                setConfirm(false);
                setTyped("");
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

    async function toggleClosed() {
        const next = !quiz.closed;
        setBusy(true);
        try {
            const r = await setQuizClosed(homeworkId, next);
            if (r.success) {
                setQuiz((q) => ({ ...q, closed: next }));
                setConfirmClose(false);
                notify(next ? "Quiz closed. Children can no longer try it." : "Quiz reopened.");
            } else {
                notify(r.message || "Could not change the quiz.", "error");
            }
        } catch (err) {
            notify(err.response?.data?.message || "Could not change the quiz.", "error");
        } finally {
            setBusy(false);
        }
    }

    if (loading || !quiz) return null;

    const tries = quiz.attempt_count || 0;

    return (
        <Box sx={{ mt: 2, p: 1.5, borderRadius: 2.5, border: "1.5px solid var(--sl-ink)", bgcolor: "var(--sl-soft)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                <QuizIcon sx={{ fontSize: 22, color: "var(--sl-ink)" }} />
                <Box sx={{ flex: 1, minWidth: 140 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.9rem", color: "var(--sl-ink)" }}>Practice quiz</Typography>
                    <Typography sx={{ fontSize: "0.76rem", color: "text.secondary" }}>
                        {quiz.questions.length} questions · {quiz.max_attempts} {quiz.max_attempts === 1 ? "try" : "tries"} per child{quiz.closed ? " · CLOSED" : ""}
                    </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                    <Box role="button" tabIndex={0} onClick={() => navigate(`/teacher/posts/${homeworkId}/quiz-results`)} sx={pillSx}>Results</Box>
                    <Box role="button" tabIndex={0} onClick={() => setShow((v) => !v)} sx={pillSx}>{show ? "Hide questions" : "Show questions"}</Box>
                    <Box role="button" tabIndex={0} onClick={() => (quiz.closed ? toggleClosed() : setConfirmClose(true))} sx={pillSx}>{quiz.closed ? "Reopen quiz" : "Close quiz"}</Box>
                    <Box role="button" tabIndex={0} onClick={() => { setTyped(""); setConfirm(true); }} sx={{ ...pillSx, color: "#B91C1C", borderColor: "#B91C1C" }}>Remove</Box>
                </Box>
            </Box>

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
                open={confirmClose}
                title="Close this quiz?"
                message="Children will not be able to try it any more. Their scores and answers are kept, and you can reopen it any time."
                confirmLabel="Close quiz"
                busy={busy}
                onConfirm={toggleClosed}
                onCancel={() => setConfirmClose(false)}
            />

            {tries === 0 ? (
                <ConfirmDialog
                    open={confirm}
                    title="Remove this quiz?"
                    message="No child has tried it yet. The quiz will be deleted. The homework itself stays."
                    confirmLabel="Remove quiz"
                    confirmColor="error"
                    busy={busy}
                    onConfirm={remove}
                    onCancel={() => setConfirm(false)}
                />
            ) : (
                <Dialog open={confirm} onClose={busy ? undefined : () => setConfirm(false)} maxWidth="xs" fullWidth>
                    <DialogHeader icon={<QuizIcon />} title="Delete quiz and all results?" tone="warning" />
                    <DialogContent sx={{ pt: 0.5 }}>
                        <Typography sx={{ color: "var(--sl-ink)", mb: 1 }}>
                            {tries} {tries === 1 ? "try has" : "tries have"} already been saved for this quiz. Removing it deletes every child's scores and answers. This cannot be undone.
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", mb: 1 }}>
                            If you only want to stop children trying it, use "Close quiz" instead. The results stay.
                        </Typography>
                        <TextField
                            label="Type REMOVE to confirm"
                            value={typed}
                            onChange={(e) => setTyped(e.target.value)}
                            fullWidth
                            size="small"
                            autoComplete="off"
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                        <Button onClick={() => setConfirm(false)} disabled={busy}>Cancel</Button>
                        <Button variant="contained" color="error" onClick={remove} disabled={busy || typed !== "REMOVE"}>Delete everything</Button>
                    </DialogActions>
                </Dialog>
            )}
        </Box>
    );
}
