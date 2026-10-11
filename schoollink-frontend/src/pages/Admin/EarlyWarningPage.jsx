import { useCallback, useEffect, useState } from "react";

import {
    Alert, Box, Button, Card, Chip, CircularProgress, MenuItem, TextField, Typography
} from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";

import { getAllClassesForManagement } from "../../services/classManagementService";
import { getAiStatus, getEarlyWarning, aiEarlyWarningNote } from "../../services/aiService";

const SEVERITY = {
    high: { label: "Needs attention", fg: "#B91C1C", bg: "#FEE2E2" },
    medium: { label: "Keep an eye", fg: "#B45309", bg: "#FEF3C7" }
};

function Metric({ label, value }) {
    return (
        <Box sx={{ minWidth: 92 }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.15 }}>{value}</Typography>
            <Typography sx={{ fontSize: "0.7rem", color: "text.secondary" }}>{label}</Typography>
        </Box>
    );
}

function StudentRow({ item, aiAvailable }) {

    const [note, setNote] = useState("");
    const [busy, setBusy] = useState(false);
    const [err, setErr] = useState("");

    const sev = SEVERITY[item.severity] || SEVERITY.medium;
    const m = item.metrics || {};

    async function suggest() {
        setBusy(true);
        setErr("");
        try {
            const res = await aiEarlyWarningNote(item.student_id);
            if (res.success) setNote(res.data.text);
            else setErr(res.message || "Could not write a suggestion.");
        } catch (e) {
            setErr(e.response?.data?.message || "Could not write a suggestion.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <Card
            data-testid="warning-row"
            sx={{
                p: { xs: 1.75, md: 2.25 },
                mb: 1.5,
                borderRadius: 3,
                border: "1px solid var(--sl-border, #EEF2F7)",
                borderLeft: `5px solid ${sev.fg}`,
                boxShadow: "var(--sl-card-shadow, 0 1px 3px rgba(15,23,42,.06))"
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.75 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1rem" }}>{item.name}</Typography>
                <Typography sx={{ fontSize: "0.82rem", color: "text.secondary", flex: 1 }}>
                    {item.class_name} - {item.section_name}
                </Typography>
                <Chip size="small" label={sev.label} sx={{ bgcolor: sev.bg, color: sev.fg, fontWeight: 700 }} />
            </Box>

            <Box component="ul" sx={{ m: 0, mb: 1.25, pl: 2.25 }}>
                {item.flags.map((f, i) => (
                    <Typography component="li" key={i} sx={{ fontSize: "0.9rem", mb: 0.25 }}>{f.text}</Typography>
                ))}
            </Box>

            <Box sx={{ display: "flex", gap: 2.5, flexWrap: "wrap", mb: 1 }}>
                {m.attendance_rate !== undefined && <Metric label="Attendance" value={`${m.attendance_rate}%`} />}
                {m.absent_streak !== undefined && <Metric label="Days absent in a row" value={m.absent_streak} />}
                {m.latest_percentage !== undefined && <Metric label={m.latest_exam || "Latest exam"} value={`${m.latest_percentage}%`} />}
                {m.previous_percentage !== undefined && <Metric label={m.previous_exam || "Previous exam"} value={`${m.previous_percentage}%`} />}
            </Box>

            {aiAvailable && !note && (
                <Button
                    size="small"
                    variant="outlined"
                    onClick={suggest}
                    disabled={busy}
                    startIcon={busy ? <CircularProgress size={14} /> : <AutoAwesomeIcon />}
                >
                    {busy ? "Writing..." : "Suggest next step"}
                </Button>
            )}

            {err && <Alert severity="warning" sx={{ mt: 1 }}>{err}</Alert>}

            {note && (
                <Box
                    data-testid="warning-note"
                    sx={{
                        mt: 0.5,
                        p: 1.5,
                        borderRadius: 2,
                        border: "1px dashed var(--sl-border, #CBD5E1)",
                        bgcolor: "var(--sl-page2, #F8FAFC)"
                    }}
                >
                    <Typography sx={{ fontSize: "0.72rem", color: "text.secondary", mb: 0.5 }}>
                        Suggested by AI from the numbers above. Please use your own judgement.
                    </Typography>
                    <Typography sx={{ fontSize: "0.9rem", lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{note}</Typography>
                </Box>
            )}
        </Card>
    );
}

export default function EarlyWarningPage() {

    const [classes, setClasses] = useState([]);
    const [classId, setClassId] = useState("");
    const [data, setData] = useState(null);
    const [aiAvailable, setAiAvailable] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        getAllClassesForManagement()
            .then((r) => { if (r.success) setClasses(r.data.filter((c) => c.is_active !== false)); })
            .catch(() => { /* filter is optional */ });
        getAiStatus()
            .then((r) => setAiAvailable(!!(r.data && r.data.available && !(r.data.features && r.data.features.early_warning === false))))
            .catch(() => setAiAvailable(false));
    }, []);

    const load = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await getEarlyWarning(classId);
            if (res.success) setData(res.data);
            else setError(res.message || "Unable to load early warnings.");
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load early warnings.");
        } finally {
            setLoading(false);
        }
    }, [classId]);

    useEffect(() => { load(); }, [load]);

    const items = data ? data.items : [];
    const high = items.filter((i) => i.severity === "high").length;

    return (
        <Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 0.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, flex: 1 }}>Early Warning</Typography>
                <TextField
                    select
                    size="small"
                    label="Class"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    sx={{ minWidth: { xs: "100%", sm: 180 } }}
                >
                    <MenuItem value="">All classes</MenuItem>
                    {classes.map((c) => <MenuItem key={c.id} value={c.id}>{c.class_name}</MenuItem>)}
                </TextField>
            </Box>

            <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", mb: 2 }}>
                Students who may need support, found from attendance and marks of the last 30 days.
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading && !data && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>
            )}

            {data && (
                <Typography data-testid="warning-summary" sx={{ fontWeight: 700, mb: 1.5 }}>
                    {items.length === 0
                        ? "No students need attention right now."
                        : `${items.length} of ${data.total_students} students flagged` + (high ? ` - ${high} need attention` : "")}
                </Typography>
            )}

            {items.map((it) => <StudentRow key={it.student_id} item={it} aiAvailable={aiAvailable} />)}

            <Typography sx={{ color: "text.secondary", fontSize: "0.76rem", mt: 2 }}>
                A student is flagged for attendance below 85% (at least 5 days recorded), 3 or more absent days in a row,
                a drop of 10 points or more between the last two exams, or marks below the pass mark in the latest exam.
                These are signals to start a conversation, not a judgement.
            </Typography>

        </Box>
    );
}
