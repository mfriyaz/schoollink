import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Card, CircularProgress, MenuItem, TextField, Typography } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import CheckIcon from "@mui/icons-material/CheckCircleRounded";
import CloseIcon from "@mui/icons-material/CancelRounded";
import { getQuizResults, getQuizStudentDetail } from "../../services/quizService";
import { getHomeworkById } from "../../services/postService";

const pillSx = (on) => ({
    px: 1.5, py: 0.5, borderRadius: 99, cursor: "pointer", userSelect: "none",
    fontSize: "0.82rem", fontWeight: 700, color: "var(--sl-ink)",
    border: "1.5px solid var(--sl-ink)",
    bgcolor: on ? "var(--sl-accent)" : "transparent",
    "&:hover": { bgcolor: on ? "var(--sl-accent)" : "var(--sl-soft)" }
});

const pct = (b) => (b && b.total ? Math.round((b.score / b.total) * 100) : null);

function Tile({ label, value, color }) {
    return (
        <Box sx={{ p: 1.25, borderRadius: 2.5, border: "1.5px solid var(--sl-ink)", bgcolor: "var(--sl-soft)" }}>
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "text.secondary", textTransform: "uppercase" }}>{label}</Typography>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 800, lineHeight: 1.2, color: color || "var(--sl-ink)" }}>{value}</Typography>
        </Box>
    );
}

/** What one child answered, try by try */
function ChildDetail({ homeworkId, studentId }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        let alive = true;
        getQuizStudentDetail(homeworkId, studentId)
            .then((r) => { if (alive) { if (r.success) setData(r.data); else setError(r.message || "Could not load."); } })
            .catch((err) => { if (alive) setError(err.response?.data?.message || "Could not load."); });
        return () => { alive = false; };
    }, [homeworkId, studentId]);

    if (error) return <Typography sx={{ color: "#B91C1C", fontSize: "0.84rem", p: 1 }}>{error}</Typography>;
    if (!data) return <Box sx={{ p: 1 }}><CircularProgress size={18} /></Box>;
    if (!data.attempts.length) return <Typography sx={{ fontSize: "0.84rem", color: "text.secondary", p: 1 }}>No tries yet.</Typography>;

    return (
        <Box sx={{ px: 1, pb: 1 }}>
            {data.attempts.map((a) => (
                <Box key={a.number} sx={{ mt: 1 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: "0.84rem" }}>
                        Try {a.number}: {a.score}/{a.total}
                        {a.is_late ? "  · LATE" : ""}
                        {a.submitted_at ? `  · ${new Date(a.submitted_at).toLocaleString()}` : ""}
                    </Typography>
                    {a.items.map((it) => (
                        <Box key={it.number} sx={{ display: "flex", gap: 0.75, alignItems: "flex-start", py: 0.4 }}>
                            {it.correct
                                ? <CheckIcon sx={{ color: "#16A34A", fontSize: 18, mt: 0.15 }} />
                                : <CloseIcon sx={{ color: "#DC2626", fontSize: 18, mt: 0.15 }} />}
                            <Box sx={{ minWidth: 0 }}>
                                <Typography sx={{ fontSize: "0.84rem" }}>{it.number}. {it.question_text}</Typography>
                                <Typography sx={{ fontSize: "0.78rem", color: it.correct ? "#15803D" : "#B91C1C" }}>
                                    Answered: {it.chosen_text === null || it.chosen_text === "" ? "no answer" : it.chosen_text}
                                </Typography>
                                {!it.correct && (
                                    <Typography sx={{ fontSize: "0.78rem", color: "#15803D", fontWeight: 700 }}>Correct: {it.correct_text}</Typography>
                                )}
                            </Box>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
}

/**
 * Full-page results of one practice quiz, built for big classes:
 * summary tiles, most-missed questions, filter / sort / search, tap a child for their answers.
 */
export default function QuizResultsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("all");
    const [sort, setSort] = useState("name");
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(null);
    const [allMissed, setAllMissed] = useState(false);

    useEffect(() => {
        let alive = true;
        getQuizResults(id)
            .then((r) => { if (alive) { if (r.success && r.data) setData(r.data); else setError(r.message || "This homework has no quiz."); } })
            .catch((err) => { if (alive) setError(err.response?.data?.message || "Could not load the results."); });
        getHomeworkById(id).then((r) => { if (alive && r.success) setTitle(r.data.title); }).catch(() => {});
        return () => { alive = false; };
    }, [id]);

    const rows = useMemo(() => {
        if (!data) return [];
        const q = search.trim().toLowerCase();
        let list = data.students.filter((s) => !q || s.name.toLowerCase().includes(q));
        if (filter === "not") list = list.filter((s) => s.tries === 0);
        if (filter === "help") list = list.filter((s) => s.tries > 0 && pct(s.best) < 50);
        const val = (s) => (s.tries === 0 ? -1 : pct(s.best));
        if (sort === "low") list = [...list].sort((a, b) => (a.tries === 0) - (b.tries === 0) || val(a) - val(b) || a.name.localeCompare(b.name));
        else if (sort === "high") list = [...list].sort((a, b) => val(b) - val(a) || a.name.localeCompare(b.name));
        else list = [...list].sort((a, b) => a.name.localeCompare(b.name));
        return list;
    }, [data, filter, sort, search]);

    const missed = useMemo(() => {
        if (!data) return [];
        return [...data.questions].sort((x, y) => (x.right / (x.total || 1)) - (y.right / (y.total || 1)) || x.number - y.number);
    }, [data]);

    const needHelp = data ? data.students.filter((s) => s.tries > 0 && pct(s.best) < 50).length : 0;

    return (
        <Box sx={{ maxWidth: 760 }}>
            <Box
                onClick={() => navigate(`/teacher/posts/${id}`)}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", cursor: "pointer", mb: 1.5, width: "fit-content" }}
            >
                <ArrowBackIcon fontSize="small" />
                <Typography sx={{ fontSize: "0.9rem", fontWeight: 600 }}>Back to post</Typography>
            </Box>

            <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.25rem", sm: "1.5rem" }, color: "var(--sl-ink)" }}>Quiz results</Typography>
                {title && <Typography sx={{ color: "text.secondary", fontSize: "0.9rem", mb: 1.5 }}>{title}</Typography>}

                {error && <Alert severity="error">{error}</Alert>}
                {!data && !error && <CircularProgress size={24} />}

                {data && (
                    <>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1, mb: 2 }}>
                            <Tile label="Tried" value={`${data.summary.tried}/${data.summary.students}`} />
                            <Tile label="Not tried" value={data.summary.students - data.summary.tried} color={data.summary.students - data.summary.tried ? "#9A3412" : undefined} />
                            <Tile label="Class average" value={data.summary.average_percent === null ? "-" : `${data.summary.average_percent}%`} />
                            <Tile label="Needs help" value={needHelp} color={needHelp ? "#B91C1C" : undefined} />
                        </Box>

                        {data.summary.tried > 0 && (
                            <Box sx={{ mb: 2 }}>
                                <Typography sx={{ fontWeight: 800, color: "var(--sl-ink)" }}>Questions most missed</Typography>
                                <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", mb: 0.5 }}>Based on each child's first try.</Typography>
                                {(allMissed ? missed : missed.slice(0, 3)).map((q) => {
                                    const p = q.total ? Math.round((q.right / q.total) * 100) : 0;
                                    return (
                                        <Box key={q.id} sx={{ py: 0.7, borderTop: "1px solid var(--sl-border)" }}>
                                            <Typography sx={{ fontSize: "0.88rem" }}>{q.number}. {q.question_text}</Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.25 }}>
                                                <Box sx={{ flex: 1, height: 8, borderRadius: 99, bgcolor: "#fff", border: "1px solid var(--sl-border)", overflow: "hidden" }}>
                                                    <Box sx={{ width: `${p}%`, height: "100%", bgcolor: p < 50 ? "#DC2626" : "#16A34A" }} />
                                                </Box>
                                                <Typography sx={{ fontSize: "0.76rem", fontWeight: 700, minWidth: 82, textAlign: "right" }}>{q.right} of {q.total} right</Typography>
                                            </Box>
                                        </Box>
                                    );
                                })}
                                {missed.length > 3 && (
                                    <Box role="button" tabIndex={0} onClick={() => setAllMissed((v) => !v)} sx={{ ...pillSx(false), display: "inline-block", mt: 0.75 }}>
                                        {allMissed ? "Show fewer" : `Show all ${missed.length} questions`}
                                    </Box>
                                )}
                            </Box>
                        )}

                        <Typography sx={{ fontWeight: 800, color: "var(--sl-ink)", mb: 0.75 }}>Children</Typography>
                        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1 }}>
                            {[["all", "All"], ["not", "Not tried"], ["help", "Needs help"]].map(([k, l]) => (
                                <Box key={k} role="button" tabIndex={0} onClick={() => setFilter(k)} sx={pillSx(filter === k)}>{l}</Box>
                            ))}
                        </Box>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 190px" }, gap: 1, mb: 1 }}>
                            <TextField size="small" placeholder="Search by name" value={search} onChange={(e) => setSearch(e.target.value)} inputProps={{ "aria-label": "Search by name" }} />
                            <TextField select size="small" value={sort} onChange={(e) => setSort(e.target.value)} inputProps={{ "aria-label": "Sort" }}>
                                <MenuItem value="name">Sort: Name</MenuItem>
                                <MenuItem value="low">Sort: Lowest score first</MenuItem>
                                <MenuItem value="high">Sort: Highest score first</MenuItem>
                            </TextField>
                        </Box>

                        {rows.length === 0 && <Typography sx={{ fontSize: "0.88rem", color: "text.secondary", py: 1 }}>No children match.</Typography>}

                        {rows.map((s) => {
                            const p = pct(s.best);
                            const isOpen = open === s.id;
                            return (
                                <Box key={s.id} sx={{ borderTop: "1px solid var(--sl-border)" }}>
                                    <Box
                                        role="button"
                                        tabIndex={0}
                                        aria-expanded={isOpen}
                                        onClick={() => setOpen(isOpen ? null : s.id)}
                                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setOpen(isOpen ? null : s.id); } }}
                                        sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.9, cursor: "pointer" }}
                                    >
                                        <Typography sx={{ flex: 1, minWidth: 0, fontSize: "0.9rem", fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.name}</Typography>
                                        {s.tries === 0 ? (
                                            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>Not tried</Typography>
                                        ) : (
                                            <>
                                                {s.any_late && <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#9A3412" }}>LATE</Typography>}
                                                <Typography sx={{ fontSize: "0.74rem", color: "text.secondary", display: { xs: "none", sm: "block" } }}>{s.tries} {s.tries === 1 ? "try" : "tries"}</Typography>
                                                <Box sx={{ width: { xs: 50, sm: 90 }, height: 8, borderRadius: 99, bgcolor: "#fff", border: "1px solid var(--sl-border)", overflow: "hidden" }}>
                                                    <Box sx={{ width: `${p}%`, height: "100%", bgcolor: p < 50 ? "#DC2626" : "#16A34A" }} />
                                                </Box>
                                                <Typography sx={{ fontSize: "0.9rem", fontWeight: 800, minWidth: 40, textAlign: "right", color: p < 50 ? "#B91C1C" : "#15803D" }}>{s.best.score}/{s.best.total}</Typography>
                                            </>
                                        )}
                                    </Box>
                                    {isOpen && s.tries > 0 && <ChildDetail homeworkId={id} studentId={s.id} />}
                                </Box>
                            );
                        })}
                    </>
                )}
            </Card>
        </Box>
    );
}
