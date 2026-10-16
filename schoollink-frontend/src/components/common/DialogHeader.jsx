import { Box, DialogTitle, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/CloseOutlined";

/**
 * Shared modern dialog header: theme-coloured icon tile, title,
 * optional subtitle and a close button.
 */
export default function DialogHeader({ icon, title, subtitle, onClose, tone }) {

    const tile = tone === "warning" ? "#FDE68A" : "var(--sl-accent, #FBBF24)";

    return (
        <DialogTitle component="div" sx={{ display: "flex", alignItems: "center", gap: 1.5, pb: 1.5 }}>
            <Box
                sx={{
                    width: 42, height: 42, minWidth: 42, borderRadius: "13px",
                    bgcolor: tile, color: "var(--sl-ink, #111827)",
                    border: "1.5px solid var(--sl-ink, #111827)",
                    boxShadow: "2px 2px 0 var(--sl-ink, #111827)",
                    display: "flex", alignItems: "center", justifyContent: "center"
                }}
            >
                {icon}
            </Box>
            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.1rem", lineHeight: 1.25, color: "var(--sl-ink, #111827)" }} noWrap>
                    {title}
                </Typography>
                {subtitle && (
                    <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }} noWrap>
                        {subtitle}
                    </Typography>
                )}
            </Box>
            {onClose && (
                <IconButton aria-label="Close" onClick={onClose} size="small">
                    <CloseIcon fontSize="small" />
                </IconButton>
            )}
        </DialogTitle>
    );
}

export function generatePassword(len = 10) {
    const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
    const arr = new Uint32Array(len);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, (n) => chars[n % chars.length]).join("");
}
