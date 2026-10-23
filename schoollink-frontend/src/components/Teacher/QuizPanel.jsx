import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import ConfirmDialog from "../common/ConfirmDialog";
import { getQuizForManage, removeQuiz } from "../../services/quizService";
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

    useEffect(() => {
        let alive = true;
        setLoading(true);
        getQuizForManage(homeworkId)
            .then((r) => { if (alive) setQuiz(r.success ? r.data : null); })
            .catch(() => { if (alive) setQuiz(null); })
            .finally(() => { if (alive) setLoading(false); });
        return () => { alive = false; };
    }, [homeworkId]);

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
                <Box sx={{ display: "flex", gap: 0.75 }}>
                    <Box role="button" tabIndex={0} onClick={() => setShow((v) => !v)} sx={pillSx}>{show ? "Hide questions" : "Show questions"}</Box>
                    <Box role="button" tabIndex={0} onClick={() => setConfirm(true)} sx={{ ...pillSx, color: "#B91C1C", borderColor: "#B91C1C" }}>Remove</Box>
                </Box>
            </Box>

            {show && quiz.questions.map((q, i) => (
                <Box key={q.id} sx={{ mt: 1.25, pt: 1, borderTop: "1px solid var(--sl-border)" }}>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }}>{i + 1}. {q.question_text}</Typography>
                    {q.options.map((o, k) => (
                        <Typography key={k} sx={{ fontSize: "0.86rem", ml: 1.5, fontWeight: k === q.correct_index ? 800 : 400, color: k === q.correct_index ? "#15803D" : "inherit" }}>
                            {LETTERS[k]}. {o}{k === q.correct_index ? "  ✓" : ""}
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
