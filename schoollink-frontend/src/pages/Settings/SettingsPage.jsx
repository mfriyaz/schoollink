import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    Divider,
    FormControlLabel,
    Switch,
    Typography
} from "@mui/material";

import SettingsIcon from "@mui/icons-material/SettingsOutlined";
import EmailIcon from "@mui/icons-material/EmailOutlined";
import NotificationsIcon from "@mui/icons-material/NotificationsOutlined";

import {
    getMySettings,
    updateMySettings
} from "../../services/settingsService";

function SettingsPage() {

    const [loading, setLoading] = useState(true);

    const [emailNotifications, setEmailNotifications] = useState(true);

    const [inAppNotifications, setInAppNotifications] = useState(true);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    useEffect(() => {

        loadSettings();

    }, []);

    async function loadSettings() {

        try {

            const response = await getMySettings();

            if (response.success) {

                setEmailNotifications(response.data.email_notifications);

                setInAppNotifications(response.data.in_app_notifications);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    async function handleSave() {

        setError("");

        setSuccess("");

        try {

            setSaving(true);

            const response = await updateMySettings({

                email_notifications: emailNotifications,

                in_app_notifications: inAppNotifications

            });

            if (response.success) {

                setSuccess("Settings saved successfully.");

            } else {

                setError(response.message);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to save settings."
            );

        } finally {

            setSaving(false);

        }

    }

    if (loading) {

        return (

            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                <CircularProgress />

            </Box>

        );

    }

    return (

        <Box sx={{ maxWidth: 640 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>

                <Box

                    sx={{

                        width: 40,

                        height: 40,

                        borderRadius: "10px",

                        bgcolor: "#DBEAFE",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center"

                    }}

                >

                    <SettingsIcon sx={{ color: "#2563EB" }} />

                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>

                    Settings

                </Typography>

            </Box>

            <Card sx={{ p: 3.5 }}>

                <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>

                    Notification Preferences

                </Typography>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                        <EmailIcon sx={{ color: "#64748B" }} />

                        <Box>

                            <Typography sx={{ fontWeight: 600 }}>

                                Email Notifications

                            </Typography>

                            <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>

                                Receive an email when new posts are published

                            </Typography>

                        </Box>

                    </Box>

                    <Switch
                        checked={emailNotifications}
                        onChange={(e) => setEmailNotifications(e.target.checked)}
                    />

                </Box>

                <Divider />

                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                        <NotificationsIcon sx={{ color: "#64748B" }} />

                        <Box>

                            <Typography sx={{ fontWeight: 600 }}>

                                In-App Notifications

                            </Typography>

                            <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>

                                Show the notification bell badge for new activity

                            </Typography>

                        </Box>

                    </Box>

                    <Switch
                        checked={inAppNotifications}
                        onChange={(e) => setInAppNotifications(e.target.checked)}
                    />

                </Box>

                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>

                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                    >

                        {saving ? "Saving..." : "Save Settings"}

                    </Button>

                </Box>

            </Card>

        </Box>

    );

}

export default SettingsPage;
