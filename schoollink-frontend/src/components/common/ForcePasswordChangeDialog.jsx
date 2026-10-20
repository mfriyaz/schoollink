import { useState } from "react";
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, IconButton, InputAdornment, TextField, Typography } from "@mui/material";
import LockResetIcon from "@mui/icons-material/LockResetOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import DialogHeader from "./DialogHeader";
import { changePassword } from "../../services/profileService";
import { notify } from "../../utils/notify";

function readUser() {
    try {
        return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
        return null;
    }
}

/** Same rules as the server (the server is the one that really enforces them). */
export function passwordProblem(p, current) {
    if (!p || p.length < 8) return "Use at least 8 characters.";
    if (!/[A-Za-z]/.test(p) || !/[0-9]/.test(p)) return "Use at least one letter and one number.";
    if (current && p === current) return "Your new password must be different from the temporary one.";
    return "";
}

/**
 * Blocks the app until a person who was given a temporary password
 * (new account or admin reset) chooses their own.
 */
function ForcePasswordChangeDialog() {
    const [user, setUser] = useState(readUser);
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [show, setShow] = useState(false);
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const open = !!(user && user.must_change_password);
    if (!open) return null;

    const mismatch = confirm !== "" && next !== confirm;

    function signOut() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.assign("/login");
    }

    async function submit() {
        setError("");
        if (!current) { setError("Please type the temporary password you were given."); return; }
        const problem = passwordProblem(next, current);
        if (problem) { setError(problem); return; }
        if (next !== confirm) { setError("The two new passwords don't match."); return; }
        try {
            setBusy(true);
            const res = await changePassword({ current_password: current, new_password: next });
            if (res.success) {
                const updated = { ...user, must_change_password: false };
                localStorage.setItem("user", JSON.stringify(updated));
                setUser(updated);
                notify("Password changed. You're all set.", "success");
            } else {
                setError(res.message || "Unable to change password.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to change password.");
        } finally {
            setBusy(false);
        }
    }

    const adornment = {
        endAdornment: (
            <InputAdornment position="end">
                <IconButton size="small" aria-label={show ? "Hide passwords" : "Show passwords"} onClick={() => setShow((v) => !v)} edge="end">
                    {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                </IconButton>
            </InputAdornment>
        )
    };

    return (
        <Dialog open fullWidth maxWidth="xs" disableEscapeKeyDown>
            <DialogHeader icon={<LockResetIcon />} title="Choose your own password" subtitle="Your password was set for you" />
            <DialogContent sx={{ pt: 0.5 }}>
                <Typography sx={{ mb: 2, fontSize: "0.9rem", color: "var(--sl-ink, #111827)" }}>
                    For your safety, please replace the temporary password with one only you know.
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    {error && <Alert severity="error">{error}</Alert>}
                    <TextField label="Temporary password" type={show ? "text" : "password"} value={current} onChange={(e) => setCurrent(e.target.value)} fullWidth autoComplete="current-password" slotProps={{ inputLabel: { shrink: true }, input: { notched: true, ...adornment } }} />
                    <TextField label="New password" type={show ? "text" : "password"} value={next} onChange={(e) => setNext(e.target.value)} fullWidth autoComplete="new-password" helperText="At least 8 characters, with a letter and a number." slotProps={{ inputLabel: { shrink: true }, input: { notched: true } }} />
                    <TextField label="Confirm new password" type={show ? "text" : "password"} value={confirm} onChange={(e) => setConfirm(e.target.value)} fullWidth autoComplete="new-password" error={mismatch} helperText={mismatch ? "Passwords don't match yet." : ""} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} slotProps={{ inputLabel: { shrink: true }, input: { notched: true } }} />
                </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={signOut} disabled={busy}>Sign out</Button>
                <Button variant="contained" onClick={submit} disabled={busy || !current || !next || !confirm}>
                    {busy ? "Saving..." : "Save password"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ForcePasswordChangeDialog;
