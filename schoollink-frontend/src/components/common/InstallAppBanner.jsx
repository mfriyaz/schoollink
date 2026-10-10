import { useEffect, useState } from "react";

import { Box, Button, IconButton, Typography } from "@mui/material";
import CloseIcon from "@mui/icons-material/CloseOutlined";

const DISMISS_KEY = "schoollink_install_dismissed";

function isStandalone() {
    return (
        window.matchMedia?.("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
}

function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

function isMobile() {
    return /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/**
 * "Install the app" bar for phones. Android/Chrome shows a real
 * Install button; iPhone shows the Add-to-Home-Screen steps.
 * Hidden once installed or dismissed.
 */
export default function InstallAppBanner() {

    const [promptEvent, setPromptEvent] = useState(null);
    const [visible, setVisible] = useState(false);
    const [showIosHelp, setShowIosHelp] = useState(false);

    useEffect(() => {

        if (!isMobile() || isStandalone()) return;

        try {
            if (localStorage.getItem(DISMISS_KEY)) return;
        } catch { /* ignore */ }

        function onPrompt(e) {
            e.preventDefault();
            setPromptEvent(e);
            setVisible(true);
        }

        function onInstalled() {
            setVisible(false);
            setPromptEvent(null);
        }

        window.addEventListener("beforeinstallprompt", onPrompt);
        window.addEventListener("appinstalled", onInstalled);

        // iPhone never fires beforeinstallprompt
        if (isIos()) setVisible(true);

        return () => {
            window.removeEventListener("beforeinstallprompt", onPrompt);
            window.removeEventListener("appinstalled", onInstalled);
        };

    }, []);

    function dismiss() {
        setVisible(false);
        try { localStorage.setItem(DISMISS_KEY, "1"); } catch { /* ignore */ }
    }

    async function install() {

        if (promptEvent) {
            promptEvent.prompt();
            await promptEvent.userChoice;
            setPromptEvent(null);
            setVisible(false);
        } else {
            setShowIosHelp((v) => !v);
        }

    }

    if (!visible) return null;

    return (

        <Box
            sx={{
                position: "fixed",
                left: 12,
                right: 12,
                bottom: 12,
                zIndex: 1400,
                bgcolor: "#0F172A",
                color: "#fff",
                borderRadius: 3,
                p: 1.5,
                boxShadow: "0 8px 24px rgba(15,23,42,0.3)"
            }}
        >

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>

                <Box
                    component="img"
                    src="/icons/icon-192.png"
                    alt=""
                    sx={{ width: 40, height: 40, borderRadius: 2, flexShrink: 0 }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        Install SchoolLink
                    </Typography>
                    <Typography sx={{ fontSize: "0.75rem", color: "#CBD5E1" }}>
                        Open it like an app - no web link to type.
                    </Typography>
                </Box>

                <Button size="small" variant="contained" onClick={install}>
                    {promptEvent ? "Install" : "How?"}
                </Button>

                <IconButton size="small" onClick={dismiss} aria-label="Dismiss" sx={{ color: "#94A3B8" }}>
                    <CloseIcon fontSize="small" />
                </IconButton>

            </Box>

            {showIosHelp && !promptEvent && (
                <Typography sx={{ mt: 1.5, fontSize: "0.8rem", color: "#E2E8F0", lineHeight: 1.6 }}>
                    1. Tap the Share button in Safari.<br />
                    2. Choose "Add to Home Screen".<br />
                    3. Tap Add. The SchoolLink icon appears on your phone.
                </Typography>
            )}

        </Box>

    );

}
