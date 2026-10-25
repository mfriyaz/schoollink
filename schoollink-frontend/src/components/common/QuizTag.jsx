import { Box } from "@mui/material";
import QuizIcon from "@mui/icons-material/QuizOutlined";

/**
 * Small "Quiz" tag shown on homework post cards.
 * variant "staff"  -> teacher/admin: question count, tries, closed
 * variant "parent" -> parent: this child's status (not tried / best score / closed)
 * Renders nothing when the post has no quiz.
 */
function QuizTag({ post, variant = "staff", onClick }) {
    const questions = Number(post?.quiz_questions) || 0;
    if (!questions) return null;

    const closed = post.quiz_closed === true;
    let text;
    let tone = { color: "var(--sl-ink)", bgcolor: "var(--sl-soft2)" };

    if (variant === "parent") {
        const tries = Number(post.quiz_tries) || 0;
        if (tries > 0 && post.quiz_best_score !== null && post.quiz_best_score !== undefined) {
            text = `Quiz · Best score ${post.quiz_best_score}/${post.quiz_best_total}`;
            tone = { color: "#15803D", bgcolor: "#DCFCE7" };
        } else if (closed) {
            text = "Quiz · Closed";
            tone = { color: "#64748B", bgcolor: "#F1F5F9" };
        } else {
            text = "Quiz · Not tried yet";
            tone = { color: "#C2410C", bgcolor: "#FFEDD5" };
        }
    } else {
        const attempts = Number(post.quiz_attempts) || 0;
        if (closed) {
            text = "Quiz · closed";
            tone = { color: "#64748B", bgcolor: "#F1F5F9" };
        } else if (attempts > 0) {
            text = `Quiz · ${attempts} ${attempts === 1 ? "try" : "tries"}`;
        } else {
            text = `Quiz · ${questions} ${questions === 1 ? "question" : "questions"}`;
        }
    }

    return (
        <Box
            component="span"
            data-testid="quiz-tag"
            role={onClick ? "button" : undefined}
            onClick={onClick ? (e) => { e.stopPropagation(); onClick(e); } : undefined}
            sx={{
                display: "inline-flex", alignItems: "center", gap: 0.5,
                px: 1, py: 0.15, borderRadius: 99, fontSize: "0.72rem", fontWeight: 700,
                cursor: onClick ? "pointer" : "default", whiteSpace: "nowrap", ...tone
            }}
        >
            <QuizIcon sx={{ fontSize: 14 }} />
            {text}
        </Box>
    );
}

export default QuizTag;
