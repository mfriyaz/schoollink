import { useCallback, useEffect, useState } from "react";

import { Alert, Box, Card, CircularProgress, IconButton, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";
import EventNoteIcon from "@mui/icons-material/EventNoteOutlined";
import RefreshIcon from "@mui/icons-material/RefreshRounded";

import { getWeeklySummary } from "../../services/aiService";

const LANGS = [
    ["en", "English"], ["ta", "தமிழ்"], ["ms", "Bahasa Melayu"], ["zh", "中文"], ["hi", "हिन्दी"]
];

const LANG_KEY = "sl_summary_lang";

function readLang() {
    try { const v = localStorage.getItem(LANG_KEY);
        return LANGS.some(([c]) => c === v) ? v : "en"; } catch (e) { return "en"; }
}

function Stat({ value, label, tone }) {
    return (
        <Box
            sx={{
                flex: "1 1 0",
                minWidth: { xs: "calc(50% - 4px)", sm: 70 },
                textAlign: "center",
                py: 1,
                px: 0.5,
                borderRadius: 2.5,
                bgcolor: "var(--sl-soft, #F1F5F9)",
                border: "1.5px solid var(--sl-ink, #0F172A)"
            }}
        >
            <Typography sx={{ fontWeight: 800, fontSize: "1.45rem", lineHeight: 1.1, color: tone || "var(--sl-ink, #0F172A)" }}>
                {value}
            </Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", mt: 0.3 }}>{label}</Typography>
        </Box>
    );
}

/**
 * "This week" card for the Parent dashboard.
 * The numbers come straight from the database. The short note is written by AI
 * (cached for the day) and the card still works if AI is off or unavailable.
 */
export default function WeeklySummaryCard({ studentId, showEmpty }) {

    const [lang, setLang] = useState(readLang);
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const load = useCallback(async (refresh) => {
        if (!studentId) return;
        setLoading(true);
        setError("");
        try {
            const res = await getWeeklySummary(studentId, lang, refresh);
            if (res.success) setData(res.data);
            else setError(res.message || "Unable to load this week.");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load this week.");
        } finally {
            setLoading(false);
        }
    }, [studentId, lang]);

    useEffect(() => { load(false); }, [load]);

    function changeLang(v) {
        setLang(v);
        try { localStorage.setItem(LANG_KEY, v); } catch (e) { /* ignore */ }
    }

    if (!studentId) return null;

    const f = data && data.facts;

    // Nothing at all this week: stay quiet instead of showing an empty card
    if (!loading && !error && f) {
        const empty = !f.attendance.recorded && !f.homework.given && !f.homework.pending_ack.length &&
            !f.announcements.count && !f.marks.length;
        if (empty && !showEmpty) return null;
        if (empty) {
            return (
                <Card data-testid="weekly-summary" sx={{ p: 2.5, borderRadius: 3, border: "1px solid var(--sl-border, #EEF2F7)", boxShadow: "var(--sl-card-shadow)" }}>
                    <Typography sx={{ fontWeight: 800, color: "var(--sl-ink)" }}>Nothing new this week for {f.first_name}.</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", mt: 0.5 }}>
                        Attendance, homework, notices and results from the last 7 days will show here.
                    </Typography>
                </Card>
            );
        }
    }

    return (
        <Card
            data-testid="weekly-summary"
            sx={{
                p: { xs: 2, md: 2.5 },
                mb: 2,
                borderRadius: 3,
                border: "1px solid var(--sl-border, #EEF2F7)",
                boxShadow: "var(--sl-card-shadow, 0 1px 3px rgba(15,23,42,.06))"
            }}
        >

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, flex: 1, minWidth: 0 }}>
                    <Box sx={{ width: 38, height: 38, minWidth: 38, borderRadius: "12px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <EventNoteIcon sx={{ color: "var(--sl-ink)", fontSize: 22 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", color: "var(--sl-ink)", lineHeight: 1.2 }}>
                        This week{f ? ` for ${f.first_name}` : ""}
                    </Typography>
                </Box>
                <TextField
                    select
                    size="small"
                    value={lang}
                    onChange={(e) => changeLang(e.target.value)}
                    label="Language"
                    sx={{ minWidth: 130, "& .MuiSelect-select": { py: 0.6, fontSize: "0.82rem" } }}
                >
                    {LANGS.map(([code, name]) => <MenuItem key={code} value={code}>{name}</MenuItem>)}
                </TextField>
            </Box>

            {loading && !data && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                    <CircularProgress size={24} />
                </Box>
            )}

            {error && <Alert severity="warning" sx={{ mb: 1 }}>{error}</Alert>}

            {f && (
                <>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1.5 }}>
                        <Stat value={f.attendance.recorded ? f.attendance.present + f.attendance.late : "-"} label="Days present" tone="#16A34A" />
                        <Stat value={f.attendance.recorded ? f.attendance.absent : "-"} label="Days absent" tone={f.attendance.absent ? "#DC2626" : undefined} />
                        <Stat value={f.homework.given} label="New homework" />
                        <Stat value={f.announcements.count} label="New notices" />
                    </Box>

                    {f.marks.map((m) => (
                        <Box key={m.exam_name} sx={{ mb: 1, p: 1.25, borderRadius: 2, bgcolor: "#DCFCE7", border: "1.5px solid #16A34A" }}>
                            <Typography sx={{ fontSize: "0.88rem", color: "#14532D" }}>
                                Results published: <b>{m.exam_name}</b> - {m.percentage}% overall
                            </Typography>
                        </Box>
                    ))}

                    {f.homework.pending_ack.length > 0 && (
                        <Box sx={{ mb: 1, p: 1.25, borderRadius: 2, bgcolor: "#FFEDD5", border: "1.5px solid #EA580C" }}>
                            <Typography sx={{ fontSize: "0.82rem", fontWeight: 800, color: "#9A3412", mb: 0.25 }}>
                                Waiting for your tick
                            </Typography>
                            {f.homework.pending_ack.map((h, i) => (
                                <Typography key={i} sx={{ fontSize: "0.84rem" }}>
                                    {h.subject}: {h.title} (due {h.due_date})
                                </Typography>
                            ))}
                        </Box>
                    )}

                    {(data.summary || data.ai_available) && (
                        <Box
                            sx={{
                                mt: 1.5,
                                p: 1.5,
                                borderRadius: 2,
                                border: "1px dashed var(--sl-border, #CBD5E1)",
                                bgcolor: "var(--sl-page2, #F8FAFC)"
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                                <AutoAwesomeIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                                <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", flex: 1 }}>
                                    Written by AI from this week's records
                                </Typography>
                                <Tooltip title="Write again">
                                    <span>
                                        <IconButton size="small" aria-label="Write again" disabled={loading} onClick={() => load(true)}>
                                            {loading ? <CircularProgress size={16} /> : <RefreshIcon fontSize="small" />}
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </Box>
                            {data.summary ? (
                                <Typography data-testid="summary-text" sx={{ fontSize: "0.92rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>
                                    {data.summary}
                                </Typography>
                            ) : (
                                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                    {data.ai_message || "The note could not be written right now."}
                                </Typography>
                            )}
                        </Box>
                    )}
                </>
            )}

        </Card>
    );
}
