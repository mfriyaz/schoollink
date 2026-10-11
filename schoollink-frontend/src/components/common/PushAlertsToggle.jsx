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

                    <PhoneAndroidIcon sx={{ color: "#64748B" }} />

                    <Box>
                        <Typography sx={{ fontWeight: 600 }}>Phone Alerts</Typography>
                        <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
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
