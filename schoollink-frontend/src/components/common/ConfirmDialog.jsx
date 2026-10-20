import { Box, Button, Dialog, DialogActions, DialogContent, Typography } from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmberRounded";
import HelpOutlineIcon from "@mui/icons-material/HelpOutlineRounded";
import DialogHeader from "./DialogHeader";

/**
 * "Are you sure?" box with Cancel and Proceed buttons.
 * Use for edits, deletes and anything that changes data.
 */
function ConfirmDialog({
    open,
    title,
    message,
    details,
    confirmLabel = "Proceed",
    confirmColor = "primary",
    onConfirm,
    onCancel,
    busy = false
}) {
    const risky = confirmColor === "error" || confirmColor === "warning";

    return (
        <Dialog open={open} onClose={busy ? undefined : onCancel} maxWidth="xs" fullWidth>
            <DialogHeader
                icon={risky ? <WarningAmberIcon /> : <HelpOutlineIcon />}
                title={title}
                tone={risky ? "warning" : undefined}
            />
            <DialogContent sx={{ pt: 0.5 }}>
                <Typography sx={{ color: "var(--sl-ink, #111827)" }}>{message}</Typography>
                {details && (
                    <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 2.5, border: "1.5px dashed var(--sl-ink, #111827)", bgcolor: "var(--sl-soft, #F8FAFC)", fontSize: "0.85rem", fontWeight: 600 }}>
                        {details}
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                <Button onClick={onCancel} disabled={busy}>Cancel</Button>
                <Button variant="contained" color={confirmColor} onClick={onConfirm} disabled={busy} autoFocus>
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default ConfirmDialog;
