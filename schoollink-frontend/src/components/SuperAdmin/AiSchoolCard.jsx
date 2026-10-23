import { useEffect, useState } from "react";

import { Alert, Box, Button, Card, Chip, MenuItem, Skeleton, Switch, TextField, Typography } from "@mui/material";

import { getSchoolAi, saveSchoolAi } from "../../services/aiService";
import { usd } from "../../utils/platformUi";

const CURRICULA = [
    "CBSE",
    "ICSE / ISC",
    "Tamil Nadu State Board",
    "Other Indian state board",
    "Cambridge (IGCSE)",
    "IB",
    "Singapore MOE"
];

const OTHER = "__other__";

/**
 * Super Admin: AI assistant switch, monthly limit and this month's usage for one school.
 */
function Panel({ title, hint, children }) {
    return (
        <Card sx={{ border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)", borderRadius: 3, p: { xs: 2, sm: 2.5 }, mb: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
            {hint && <Typography sx={{ color: "text.secondary", fontSize: "0.8rem", mb: 1.5 }}>{hint}</Typography>}
            {children}
        </Card>
    );
}

export default function AiSchoolCard({ schoolId }) {

    const [info, setInfo] = useState(null);
    const [enabled, setEnabled] = useState(true);
    const [limit, setLimit] = useState("300");
    const [features, setFeatures] = useState({});
    const [curriculum, setCurriculum] = useState("");
    const [curriculumPick, setCurriculumPick] = useState("");
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        getSchoolAi(schoolId)
            .then((r) => {
                setInfo(r.data);
                setEnabled(r.data.enabled);
                setLimit(String(r.data.limit));
                setFeatures(r.data.features || {});
                const c = r.data.curriculum || "";
                setCurriculum(c);
                setCurriculumPick(!c ? "" : CURRICULA.includes(c) ? c : OTHER);
            })
            .catch(() => setMsg({ type: "error", text: "Unable to load AI settings." }));
    }, [schoolId]);

    async function save() {
        setBusy(true);
        setMsg(null);
        try {
            const r = await saveSchoolAi(schoolId, { enabled, limit: Number(limit), features, curriculum: curriculum.trim() });
            setInfo(r.data);
            setFeatures(r.data.features || {});
            setCurriculum(r.data.curriculum || "");
            setMsg({ type: "success", text: "AI settings saved." });
        } catch (err) {
            setMsg({ type: "error", text: err.response?.data?.message || "Unable to save." });
        } finally {
            setBusy(false);
        }
    }

    if (!info && !msg) return <Skeleton variant="rounded" height={220} />;

    const list = (info && info.feature_list) || [];
    const featuresChanged = info && list.some((f) => (features[f.key] !== false) !== (info.features[f.key] !== false));
    const changed = info && (enabled !== info.enabled || Number(limit) !== info.limit || featuresChanged || curriculum.trim() !== (info.curriculum || ""));

    const used = info ? info.requests : 0;
    const lim = info ? info.limit : 0;
    const pct = lim ? Math.min(100, Math.round((used / lim) * 100)) : 0;
    const barColor = !enabled ? "#CBD5E1" : pct >= 100 ? "#EF4444" : pct >= 80 ? "#F59E0B" : "var(--sl-accent)";

    return (
        <Box>
            {msg && <Alert severity={msg.type} sx={{ mb: 1.5 }}>{msg.text}</Alert>}

            {info && !info.configured && (
                <Alert severity="warning" sx={{ mb: 1.5 }}>
                    The AI key is not set on the server yet, so AI will stay hidden for every school.
                </Alert>
            )}

            <Panel title="AI assistant" hint="Master switch and this month's use">
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, mb: 2 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>{enabled ? "AI is on for this school" : "AI is off for this school"}</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: "0.78rem" }}>Turning it off hides every AI feature for its teachers and admins.</Typography>
                    </Box>
                    <Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} inputProps={{ "aria-label": "AI master switch" }} />
                </Box>

                {info && (
                    <Box sx={{ opacity: enabled ? 1 : 0.55 }}>
                        <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 1, mb: 0.75 }}>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.6rem", color: "var(--sl-ink)", lineHeight: 1 }}>
                                {used}<Typography component="span" sx={{ fontSize: "0.95rem", fontWeight: 600, color: "text.secondary" }}> of {lim} uses</Typography>
                            </Typography>
                            <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>about {usd(info.cost_usd)} this month</Typography>
                        </Box>
                        <Box sx={{ height: 10, borderRadius: 5, bgcolor: "#F1F5F9", overflow: "hidden", border: "1px solid var(--sl-border)" }}>
                            <Box sx={{ height: "100%", width: `${used ? Math.max(pct, 3) : 0}%`, bgcolor: barColor }} />
                        </Box>
                        {info.by_feature.length === 0 ? (
                            <Typography sx={{ color: "text.secondary", fontSize: "0.8rem", mt: 1 }}>No AI use yet this month.</Typography>
                        ) : (
                            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1.25 }}>
                                {info.by_feature.map((f) => (
                                    <Chip key={f.feature} size="small" variant="outlined" label={`${f.feature}: ${f.requests}`} />
                                ))}
                            </Box>
                        )}
                    </Box>
                )}

                <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mt: 2 }}>
                    <TextField
                        label="Monthly limit (uses)"
                        type="number"
                        size="small"
                        value={limit}
                        onChange={(e) => setLimit(e.target.value)}
                        sx={{ width: 190 }}
                    />
                    <Typography sx={{ color: "text.secondary", fontSize: "0.78rem", flex: 1, minWidth: 160 }}>
                        One generation counts as one use. The count restarts each month.
                    </Typography>
                </Box>
            </Panel>

            {list.length > 0 && (
                <Panel title="Features" hint="Choose what this school can use">
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1, opacity: enabled ? 1 : 0.5 }}>
                        {list.map((f) => {
                            const on = features[f.key] !== false;
                            return (
                                <Box
                                    key={f.key}
                                    sx={{
                                        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1,
                                        px: 1.5, py: 0.75, borderRadius: 2.5,
                                        border: "1.5px solid", borderColor: on && enabled ? "var(--sl-ink)" : "var(--sl-border)",
                                        bgcolor: on && enabled ? "var(--sl-soft)" : "transparent"
                                    }}
                                >
                                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 600 }}>{f.label}</Typography>
                                    <Switch
                                        size="small"
                                        disabled={!enabled}
                                        checked={on}
                                        onChange={(e) => setFeatures({ ...features, [f.key]: e.target.checked })}
                                        inputProps={{ "aria-label": f.label }}
                                    />
                                </Box>
                            );
                        })}
                    </Box>
                </Panel>
            )}

            <Panel title="Curriculum" hint="Used by AI features such as the homework generator">
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", flexWrap: "wrap" }}>
                    <TextField
                        select
                        size="small"
                        label="Curriculum / board"
                        value={curriculumPick}
                        onChange={(e) => {
                            const v = e.target.value;
                            setCurriculumPick(v);
                            setCurriculum(v === OTHER ? (CURRICULA.includes(curriculum) ? "" : curriculum) : v);
                        }}
                        sx={{ minWidth: 240 }}
                    >
                        <MenuItem value="">Not set (general curriculum)</MenuItem>
                        {CURRICULA.map((c) => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                        <MenuItem value={OTHER}>Other (type the name)</MenuItem>
                    </TextField>
                    {curriculumPick === OTHER && (
                        <TextField
                            size="small"
                            label="Board name"
                            value={curriculum}
                            onChange={(e) => setCurriculum(e.target.value)}
                            inputProps={{ maxLength: 80 }}
                            sx={{ minWidth: 220 }}
                        />
                    )}
                </Box>
            </Panel>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" onClick={save} disabled={!changed} loading={busy} loadingPosition="start">
                    Save changes
                </Button>
            </Box>
        </Box>
    );
}
