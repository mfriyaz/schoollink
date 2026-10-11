import { useEffect, useState } from "react";

import { Alert, Box, Button, FormControlLabel, Switch, TextField, Typography } from "@mui/material";

import { getSchoolAi, saveSchoolAi } from "../../services/aiService";
import { usd } from "../../utils/platformUi";

/**
 * Super Admin: AI assistant switch, monthly limit and this month's usage for one school.
 */
export default function AiSchoolCard({ schoolId }) {

    const [info, setInfo] = useState(null);
    const [enabled, setEnabled] = useState(true);
    const [limit, setLimit] = useState("300");
    const [features, setFeatures] = useState({});
    const [busy, setBusy] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        getSchoolAi(schoolId)
            .then((r) => {
                setInfo(r.data);
                setEnabled(r.data.enabled);
                setLimit(String(r.data.limit));
                setFeatures(r.data.features || {});
            })
            .catch(() => setMsg({ type: "error", text: "Unable to load AI settings." }));
    }, [schoolId]);

    async function save() {
        setBusy(true);
        setMsg(null);
        try {
            const r = await saveSchoolAi(schoolId, { enabled, limit: Number(limit), features });
            setInfo(r.data);
            setFeatures(r.data.features || {});
            setMsg({ type: "success", text: "AI settings saved." });
        } catch (err) {
            setMsg({ type: "error", text: err.response?.data?.message || "Unable to save." });
        } finally {
            setBusy(false);
        }
    }

    if (!info && !msg) return null;

    const list = (info && info.feature_list) || [];
    const featuresChanged = info && list.some((f) => (features[f.key] !== false) !== (info.features[f.key] !== false));
    const changed = info && (enabled !== info.enabled || Number(limit) !== info.limit || featuresChanged);

    return (
        <Box>
            {msg && <Alert severity={msg.type} sx={{ mb: 1.5 }}>{msg.text}</Alert>}

            {info && !info.configured && (
                <Alert severity="warning" sx={{ mb: 1.5 }}>
                    The AI key is not set on the server yet, so AI will stay hidden for every school.
                </Alert>
            )}

            <FormControlLabel
                control={<Switch checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />}
                label="AI for this school (master switch)"
            />

            {list.length > 0 && (
                <Box sx={{ pl: 4, display: "flex", flexDirection: "column", opacity: enabled ? 1 : 0.5 }}>
                    {list.map((f) => (
                        <FormControlLabel
                            key={f.key}
                            disabled={!enabled}
                            control={
                                <Switch
                                    size="small"
                                    checked={features[f.key] !== false}
                                    onChange={(e) => setFeatures({ ...features, [f.key]: e.target.checked })}
                                />
                            }
                            label={<Typography sx={{ fontSize: "0.9rem" }}>{f.label}</Typography>}
                        />
                    ))}
                </Box>
            )}

            <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", mt: 1.5 }}>
                <TextField
                    label="Monthly limit (uses)"
                    type="number"
                    size="small"
                    value={limit}
                    onChange={(e) => setLimit(e.target.value)}
                    sx={{ width: 190 }}
                />
                <Button variant="contained" onClick={save} disabled={!changed} loading={busy} loadingPosition="start">
                    Save
                </Button>
            </Box>

            {info && (
                <Box sx={{ mt: 2 }}>
                    <Typography sx={{ fontSize: "0.85rem" }}>
                        This month: <b>{info.requests}</b> of {info.limit} uses
                        {" - "}about {usd(info.cost_usd)}
                    </Typography>
                    {info.by_feature.map((f) => (
                        <Typography key={f.feature} sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
                            {f.feature}: {f.requests}
                        </Typography>
                    ))}
                </Box>
            )}
        </Box>
    );
}
