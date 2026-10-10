import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Typography
} from "@mui/material";

import { resetUserPassword } from "../../services/passwordResetService";

/**
 * Admin-side password reset. Step 1: confirm. Step 2: show the
 * new temporary password once so the admin can pass it on.
 */
export default function ResetPasswordDialog({ open, userId, name, onClose }) {

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

            const res = await resetUserPassword(userId);

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

            <DialogTitle>Reset password{name ? ` for ${name}` : ""}</DialogTitle>

            <DialogContent>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {!password ? (

                    <Typography sx={{ fontSize: "0.9rem" }}>
                        This will replace the current password with a new temporary one.
                        The old password will stop working immediately.
                    </Typography>

                ) : (

                    <>
                        <Alert severity="success" sx={{ mb: 2 }}>
                            Password reset. Share this with them securely - it is shown only once.
                        </Alert>

                        <Box sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: "#F1F5F9",
                            textAlign: "center",
                            fontFamily: "monospace",
                            fontSize: "1.3rem",
                            letterSpacing: 2,
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

            <DialogActions>

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
                        <Button onClick={handleCopy}>{copied ? "Copied" : "Copy"}</Button>
                        <Button variant="contained" onClick={onClose}>Done</Button>
                    </>
                )}

            </DialogActions>

        </Dialog>

    );

}
