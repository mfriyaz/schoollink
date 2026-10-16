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
import PushAlertsToggle from "../../components/common/PushAlertsToggle";
import ThemePicker from "../../components/common/ThemePicker";
import {
    getMySettings,
    updateMySettings
} from "../../services/settingsService";
function SettingsPage() {
    let isSchoolAdmin = false;
    try { isSchoolAdmin = JSON.parse(localStorage.getItem("user"))?.role === "School Admin"; } catch { /* ignore */ }
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
                        width: 46,
                        height: 46,
                        borderRadius: "14px",
                        bgcolor: "var(--sl-accent)",
                        border: "1.5px solid var(--sl-ink)",
                        boxShadow: "2px 2px 0 var(--sl-ink)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <SettingsIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, color: "var(--sl-ink)" }}>
                    Settings
                </Typography>
            </Box>
            <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "var(--sl-ink)", mb: 1.5 }}>
                    Notification Preferences
                </Typography>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 1.5 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, minWidth: 40, borderRadius: "12px", bgcolor: "#E0F2FE", border: "1.5px solid var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}><EmailIcon sx={{ color: "#0284C7", fontSize: 21 }} /></Box>
                        <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                                Email Notifications
                            </Typography>
                            <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
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
                        <Box sx={{ width: 40, height: 40, minWidth: 40, borderRadius: "12px", bgcolor: "#FEF3C7", border: "1.5px solid var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}><NotificationsIcon sx={{ color: "#D97706", fontSize: 21 }} /></Box>
                        <Box>
                            <Typography sx={{ fontWeight: 600 }}>
                                In-App Notifications
                            </Typography>
                            <Typography sx={{ color: "text.secondary", fontSize: "0.82rem" }}>
                                Show the notification bell badge for new activity
                            </Typography>
                        </Box>
                    </Box>
                    <Switch
                        checked={inAppNotifications}
                        onChange={(e) => setInAppNotifications(e.target.checked)}
                    />
                </Box>
<PushAlertsToggle />
                <Box sx={{ display: "flex", justifyContent: { xs: "stretch", sm: "flex-end" }, mt: 2 }}>
                    <Button sx={{ flex: { xs: 1, sm: "none" } }} loading={saving} loadingPosition="start"
                        variant="contained"
                        onClick={handleSave}
                        disabled={saving}
                    >
                        {saving ? "Saving..." : "Save Settings"}
                    </Button>
                </Box>
            </Card>
            {isSchoolAdmin && <ThemePicker />}
        </Box>
    );
}
export default SettingsPage;
