import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    Typography
} from "@mui/material";

import DialogHeader from "./DialogHeader";
import LockResetIcon from "@mui/icons-material/LockResetOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopyOutlined";
import CheckIcon from "@mui/icons-material/CheckOutlined";
import { resetUserPassword } from "../../services/passwordResetService";

/**
 * Admin-side password reset. Step 1: confirm. Step 2: show the
 * new temporary password once so the admin can pass it on.
 */
export default function ResetPasswordDialog({ open, userId, name, onClose, onReset }) {

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [password, setPassword] = useState("");
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (open) {
            setLoading(false);
            setError("");
            setPassword("");
            setCopied(false);
        }
    }, [open]);

    async function handleReset() {

        setLoading(true);
        setError("");

        try {

            const res = onReset ? await onReset() : await resetUserPassword(userId);

            setPassword(res.data.temporary_password);

        } catch (err) {

            setError(err.response?.data?.message || "Unable to reset the password.");

        } finally {

            setLoading(false);

        }

    }

    async function handleCopy() {

        try {
            await navigator.clipboard.writeText(password);
            setCopied(true);
        } catch {
            setCopied(false);
        }

    }

    return (

        <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>

            <DialogHeader
                icon={<LockResetIcon />}
                tone="warning"
                title="Reset password"
                subtitle={name}
                onClose={loading ? undefined : onClose}
            />

            <DialogContent>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {!password ? (

                    <Alert severity="warning" icon={false}>
                        This replaces the current password with a new temporary one.
                        The old password stops working immediately.
                    </Alert>

                ) : (

                    <>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Password reset. Share this with them securely - it is shown only once.
                        </Alert>

                        <Box sx={{
                            p: 2,
                            borderRadius: 3,
                            bgcolor: "var(--sl-soft, #F1F5F9)",
                            border: "1.5px dashed var(--sl-ink, #111827)",
                            textAlign: "center",
                            fontFamily: "monospace",
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            letterSpacing: 3,
                            wordBreak: "break-all",
                            userSelect: "all"
                        }}>
                            {password}
                        </Box>

                        <Typography sx={{ mt: 1.5, fontSize: "0.8rem", color: "#64748B" }}>
                            Ask them to log in and change it under Profile - Change Password.
                        </Typography>
                    </>

                )}

            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>

                {!password ? (
                    <>
                        <Button onClick={onClose} disabled={loading}>Cancel</Button>
                        <Button variant="contained" color="warning" onClick={handleReset}
                            loading={loading} loadingPosition="start">
                            Reset Password
                        </Button>
                    </>
                ) : (
                    <>
                        <Button onClick={handleCopy} startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}>{copied ? "Copied" : "Copy"}</Button>
                        <Button variant="contained" onClick={onClose}>Done</Button>
                    </>
                )}

            </DialogActions>

        </Dialog>

    );

}
