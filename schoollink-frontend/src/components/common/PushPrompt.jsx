import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import { Box, Button, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/CloseOutlined";

import { enablePush, isPushSupported, isSubscribed } from "../../utils/push";

const DISMISS_KEY = "schoollink_push_prompt_dismissed";

function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isStandalone() {
    return (
        window.matchMedia?.("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
}

/**
 * One-time "Turn on alerts" bar for logged-in users on this
 * device. Hidden if already on, blocked, dismissed, or (on
 * iPhone) the app has not been added to the Home Screen yet.
 */
export default function PushPrompt() {

    const location = useLocation();
    const [visible, setVisible] = useState(false);
    const [busy, setBusy] = useState(false);

    useEffect(() => {

        let cancelled = false;

        async function check() {

            setVisible(false);

            const loggedIn = Boolean(localStorage.getItem("token"));

            if (!loggedIn || !isPushSupported()) return;
            if (Notification.permission !== "default") return;
            if (isIos() && !isStandalone()) return;

            try {
                if (localStorage.getItem(DISMISS_KEY)) return;
            } catch { /* ignore */ }

            if (await isSubscribed()) return;

            if (!cancelled) setVisible(true);

        }

        check();

        return () => { cancelled = true; };

    }, [location.pathname]);

    function dismiss() {
        setVisible(false);
        try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
    }

    async function turnOn() {
        setBusy(true);
        await enablePush();
        setBusy(false);
        setVisible(false);
    }

    if (!visible) return null;

    return (

        <Box
            sx={{
                position: "fixed",
                top: 10,
                left: 12,
                right: 12,
                zIndex: 1400,
                bgcolor: "var(--sl-ink)",
                color: "#fff",
                borderRadius: 3,
                p: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                boxShadow: "0 8px 24px rgba(15,23,42,0.3)",
                maxWidth: 520,
                mx: "auto"
            }}
        >

            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    Turn on alerts?
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#CBD5E1" }}>
                    Get a phone alert when a new post or announcement is published.
                </Typography>
            </Box>

            <Button size="small" variant="contained" onClick={turnOn} loading={busy}>
                Turn on
            </Button>

            <IconButton size="small" onClick={dismiss} aria-label="Dismiss" sx={{ color: "#94A3B8" }}>
                <CloseIcon fontSize="small" />
            </IconButton>

        </Box>

    );

}
