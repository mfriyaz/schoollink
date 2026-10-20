import { useEffect, useState } from "react";
import { Box, Snackbar, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorIcon from "@mui/icons-material/ErrorRounded";
import CloseIcon from "@mui/icons-material/CloseRounded";

/** Shows messages sent with notify(); mount once in the layout. */
export default function Notifier() {
    const [item, setItem] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        function onNotify(e) {
            setItem(e.detail);
            setOpen(true);
        }
        window.addEventListener("sl-notify", onNotify);
        return () => window.removeEventListener("sl-notify", onNotify);
    }, []);

    const ok = !item || item.type !== "error";

    return (
        <Snackbar
            key={item?.id}
            open={open}
            autoHideDuration={ok ? 4500 : 7000}
            onClose={(_, reason) => { if (reason !== "clickaway") setOpen(false); }}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
            sx={{ top: { xs: 72, md: 80 } }}
        >
            <Box
                role="status"
                data-testid="notifier"
                sx={{
                    display: "flex", alignItems: "center", gap: 1.25, px: 1.75, py: 1.25, maxWidth: 520,
                    borderRadius: 3, bgcolor: ok ? "#DCFCE7" : "#FEE2E2", color: "var(--sl-ink, #111827)",
                    border: "1.5px solid var(--sl-ink, #111827)", boxShadow: "3px 3px 0 var(--sl-ink, #111827)"
                }}
            >
                {ok ? <CheckCircleIcon sx={{ color: "#16A34A" }} /> : <ErrorIcon sx={{ color: "#DC2626" }} />}
                <Typography sx={{ fontWeight: 700, fontSize: "0.92rem", flex: 1 }}>{item?.message}</Typography>
                <CloseIcon onClick={() => setOpen(false)} sx={{ fontSize: 18, cursor: "pointer", opacity: 0.7 }} />
            </Box>
        </Snackbar>
    );
}
