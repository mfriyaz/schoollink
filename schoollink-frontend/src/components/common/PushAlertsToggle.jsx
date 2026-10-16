import { useEffect, useState } from "react";
import { Alert, Box, Divider, Switch, Typography } from "@mui/material";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroidOutlined";
import { disablePush, enablePush, isPushSupported, isSubscribed } from "../../utils/push";
function isIos() {
    return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}
function isStandalone() {
    return (
        window.matchMedia?.("(display-mode: standalone)").matches ||
        window.navigator.standalone === true
    );
}
/** Settings row: phone alerts on/off for THIS device */
export default function PushAlertsToggle() {
    const [on, setOn] = useState(false);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState("");
    const supported = isPushSupported();
    const needsInstall = isIos() && !isStandalone();
    useEffect(() => {
        isSubscribed().then(setOn);
    }, []);
    async function toggle(e) {
        const want = e.target.checked;
        setMessage("");
        setBusy(true);
        if (want) {
            const res = await enablePush();
            setOn(res.ok);
            if (!res.ok) {
                setMessage(
                    res.reason === "denied"
                        ? "Notifications are blocked for this site. Allow them in your phone or browser settings, then try again."
                        : "Could not turn on phone alerts. Please try again."
                );
            }
        } else {
            await disablePush();
            setOn(false);
        }
        setBusy(false);
    }
    return (
        <>
            <Divider />
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5, gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Box sx={{ width: 40, height: 40, minWidth: 40, borderRadius: "12px", bgcolor: "#DCFCE7", border: "1.5px solid var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}><PhoneAndroidIcon sx={{ color: "#16A34A", fontSize: 21 }} /></Box>
                    <Box>
                        <Typography sx={{ fontWeight: 600 }}>Phone Alerts</Typography>
                        <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                            Get an alert on this device when a new post or announcement is published
                        </Typography>
                    </Box>
                </Box>
                <Switch
                    checked={on}
                    onChange={toggle}
                    disabled={busy || !supported || needsInstall}
                />
            </Box>
            {needsInstall && (
                <Alert severity="info" sx={{ mb: 1 }}>
                    On iPhone, first add SchoolLink to your Home Screen (Share, then Add to Home Screen) and open it from there. Then you can turn alerts on.
                </Alert>
            )}
            {!supported && !needsInstall && (
                <Alert severity="info" sx={{ mb: 1 }}>
                    This browser does not support phone alerts.
                </Alert>
            )}
            {message && <Alert severity="warning" sx={{ mb: 1 }}>{message}</Alert>}
        </>
    );
}
