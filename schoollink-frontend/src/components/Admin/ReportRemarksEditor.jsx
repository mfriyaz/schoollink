import { useEffect, useState } from "react";

import { Alert, Box, Button, MenuItem, TextField, Typography } from "@mui/material";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesomeOutlined";

import { aiReportRemarks, getAiStatus } from "../../services/aiService";
import { saveReportRemarks } from "../../services/reportCardService";

const MAX = 1000;

/**
 * Remarks box on a report card, with an optional "Suggest with AI" button.
 *   initial   saved remarks (string)
 *   onSaved   called with the saved text
 */
export default function ReportRemarksEditor({ studentId, examId, initial, onSaved }) {

    const [text, setText] = useState(initial || "");
    const [saved, setSaved] = useState(initial || "");
    const [ai, setAi] = useState(null);
    const [language, setLanguage] = useState("en");
    const [aiUsed, setAiUsed] = useState(false);
    const [aiBusy, setAiBusy] = useState(false);
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState(null);

    useEffect(() => {
        setText(initial || "");
        setSaved(initial || "");
        setAiUsed(false);
        setMsg(null);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [studentId, examId]);

    useEffect(() => {
        let alive = true;
        getAiStatus()
            .then((r) => { if (alive) setAi(r.data); })
            .catch(() => { if (alive) setAi(null); });
        return () => { alive = false; };
    }, []);

    async function suggest() {
        setAiBusy(true);
        setMsg(null);
        try {
            const r = await aiReportRemarks(studentId, examId, language === "en" ? undefined : language);
            setText(r.data.text);
            setAiUsed(true);
            setAi((a) => ({ ...a, remaining: r.data.remaining }));
            setMsg({ type: "info", text: "Written by AI from the marks. Please read it and edit before saving." });
        } catch (err) {
            setMsg({ type: "error", text: err.response?.data?.message || "Unable to reach the AI. Please try again." });
        } finally {
            setAiBusy(false);
        }
    }

    async function save() {
        setSaving(true);
        setMsg(null);
        try {
            const r = await saveReportRemarks(studentId, examId, text, aiUsed);
            const value = r.data?.remarks ?? text.trim();
            setSaved(value);
            setText(value);
            if (onSaved) onSaved(value);
            setMsg({ type: "success", text: value ? "Remarks saved. Parents will see them." : "Remarks removed." });
        } catch (err) {
            setMsg({ type: "error", text: err.response?.data?.message || "Unable to save remarks." });
        } finally {
            setSaving(false);
        }
    }

    const aiOn = ai && ai.available;
    const noneLeft = aiOn && ai.remaining <= 0;
    const changed = text.trim() !== saved.trim();

    return (
        <Box sx={{ mt: 3, pt: 2.5, borderTop: "1px solid var(--sl-border, #EEF2F7)" }}>

            <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Remarks for parents</Typography>
            <Typography sx={{ color: "text.secondary", fontSize: "0.82rem", mb: 1.5 }}>
                Shown on the PDF report card and in the parent's Exam Results.
            </Typography>

            {msg && <Alert severity={msg.type} sx={{ mb: 1.5 }}>{msg.text}</Alert>}

            <TextField
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g. Asha has done very well in Mathematics. Keep practising reading."
                multiline
                minRows={3}
                fullWidth
                slotProps={{ htmlInput: { maxLength: MAX } }}
                helperText={`${text.length}/${MAX}`}
            />

            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", mt: 1.5 }}>

                {aiOn && (
                    <>
                        <TextField
                            select
                            size="small"
                            label="Language"
                            value={language}
                            onChange={(e) => setLanguage(e.target.value)}
                            sx={{ minWidth: 150 }}
                        >
                            {ai.languages.map((l) => (
                                <MenuItem key={l.code} value={l.code}>{l.name}</MenuItem>
                            ))}
                        </TextField>

                        <Button
                            variant="outlined"
                            startIcon={<AutoAwesomeIcon />}
                            onClick={suggest}
                            loading={aiBusy}
                            loadingPosition="start"
                            disabled={noneLeft || aiBusy}
                        >
                            {text.trim() ? "Suggest again" : "Suggest with AI"}
                        </Button>
                    </>
                )}

                <Box sx={{ flex: 1 }} />

                <Button variant="contained" onClick={save} disabled={!changed || saving} loading={saving} loadingPosition="start">
                    Save remarks
                </Button>

            </Box>

            {aiOn && (
                <Typography sx={{ color: "text.secondary", fontSize: "0.72rem", mt: 1 }}>
                    {noneLeft ? "This month's AI limit is used up." : `${ai.remaining} AI uses left this month.`}
                </Typography>
            )}

        </Box>
    );
}
