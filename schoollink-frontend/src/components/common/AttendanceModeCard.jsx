import { useEffect, useState } from "react";

import { Alert, Box, Button, Card, MenuItem, Skeleton, TextField, Typography } from "@mui/material";
import FactCheckIcon from "@mui/icons-material/FactCheckOutlined";

import { getAttendanceMode, saveAttendanceMode } from "../../services/settingsService";
import { notify } from "../../utils/notify";

const EDIT_LIMITS = [
    { value: "", label: "No limit" },
    { value: "0", label: "Same day only" },
    { value: "1", label: "1 day back" },
    { value: "2", label: "2 days back" },
    { value: "3", label: "3 days back" },
    { value: "7", label: "7 days back" }
];

const OPTIONS = [
    { value: "subject", title: "By subject", text: "Each subject teacher takes attendance in their own period." },
    { value: "daily", title: "Once a day", text: "The class teacher takes one attendance for the whole day." },
    { value: "half_day", title: "Morning and afternoon", text: "The class teacher takes attendance twice a day. A missed session counts as half a day." }
];

/**
 * School Admin: how this school takes attendance.
 */
export default function AttendanceModeCard() {

    const [saved, setSaved] = useState(null);
    const [mode, setMode] = useState("subject");
    const [limit, setLimit] = useState("");
    const [savedLimit, setSavedLimit] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        getAttendanceMode()
            .then((r) => { if (r.success) {
                setSaved(r.data.mode); setMode(r.data.mode);
                const l = Number.isInteger(r.data.edit_days) ? String(r.data.edit_days) : "";
                setLimit(l); setSavedLimit(l);
            } })
            .catch(() => setError("Unable to load this setting."));
    }, []);

    async function save() {
        setBusy(true);
        setError("");
        try {
            const r = await saveAttendanceMode(mode, limit === "" ? null : Number(limit));
            if (r.success) {
                setSaved(r.data.mode);
                setSavedLimit(Number.isInteger(r.data.edit_days) ? String(r.data.edit_days) : "");
                notify("Attendance setting saved.");
            } else {
                setError(r.message || "Unable to save.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to save.");
        } finally {
            setBusy(false);
        }
    }

    return (
        <Card sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: "var(--sl-tile)", border: "1.5px solid var(--sl-oc)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FactCheckIcon sx={{ color: "var(--sl-tile-ink)" }} />
                </Box>
                <Box>
                    <Typography sx={{ fontWeight: 800, color: "var(--sl-ink)" }}>How attendance is taken</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>Choose what suits your school.</Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}

            {saved === null && !error ? (
                <Skeleton variant="rounded" height={150} />
            ) : (
                <>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                        {OPTIONS.map((o) => (
                            <Box
                                key={o.value}
                                role="radio"
                                aria-checked={mode === o.value}
                                tabIndex={0}
                                onClick={() => setMode(o.value)}
                                onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setMode(o.value)}
                                sx={{
                                    px: 1.75, py: 1.1, borderRadius: 2.5, cursor: "pointer",
                                    border: "1.5px solid", borderColor: mode === o.value ? "var(--sl-ink)" : "var(--sl-border)",
                                    bgcolor: mode === o.value ? "var(--sl-soft)" : "transparent"
                                }}
                            >
                                <Typography sx={{ fontWeight: 700, fontSize: "0.92rem" }}>{o.title}</Typography>
                                <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }}>{o.text}</Typography>
                            </Box>
                        ))}
                    </Box>

                    {mode !== "subject" && (
                        <Alert severity="info" sx={{ mt: 1.5 }}>
                            Only the class teacher of each class can take attendance. Make sure every class has a class teacher. Attendance already taken is kept.
                        </Alert>
                    )}

                    <Box sx={{ mt: 2 }}>
                        <TextField select size="small" fullWidth label="How far back can teachers change attendance?" value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            helperText="Stops old records being changed quietly. The School Admin can always change any day.">
                            {EDIT_LIMITS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                        </TextField>
                    </Box>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
                        <Button variant="contained" onClick={save} disabled={busy || (mode === saved && limit === savedLimit)} loading={busy} loadingPosition="start">
                            Save
                        </Button>
                    </Box>
                </>
            )}
        </Card>
    );
}
