import { useEffect, useState } from "react";

import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    IconButton,
    InputAdornment,
    TextField,
    Typography
} from "@mui/material";

import PersonIcon from "@mui/icons-material/PersonOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import MailIcon from "@mui/icons-material/MailOutlined";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import { passwordProblem } from "../../components/common/ForcePasswordChangeDialog";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";

import {
    getMyProfile,
    updateMyProfile,
    changePassword
} from "../../services/profileService";

function initials(name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "?";
    return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function PasswordField({ label, value, onChange, show, onToggle, autoComplete, error, helperText }) {
    return (
        <TextField
            label={label}
            type={show ? "text" : "password"}
            value={value}
            onChange={onChange}
            fullWidth
            autoComplete={autoComplete}
            error={error}
            helperText={helperText}
            slotProps={{
                inputLabel: { shrink: true },
                input: {
                    notched: true,
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton size="small" aria-label={show ? "Hide password" : "Show password"} onClick={onToggle} edge="end">
                                {show ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                            </IconButton>
                        </InputAdornment>
                    )
                }
            }}
        />
    );
}

function ProfilePage() {

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState(null);

    const [fullName, setFullName] = useState("");
    const [mobile, setMobile] = useState("");
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState("");
    const [profileSuccess, setProfileSuccess] = useState("");

    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");

    useEffect(() => {
        loadProfile();
    }, []);

    async function loadProfile() {
        try {
            const response = await getMyProfile();
            if (response.success) {
                setProfile(response.data);
                setFullName(response.data.full_name || "");
                setMobile(response.data.mobile || "");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleSaveProfile() {
        setProfileError("");
        setProfileSuccess("");

        if (!fullName.trim()) {
            setProfileError("Full name is required.");
            return;
        }

        try {
            setSavingProfile(true);
            const response = await updateMyProfile({ full_name: fullName.trim(), mobile });

            if (response.success) {
                setProfileSuccess("Profile updated successfully.");
                setProfile((p) => ({ ...p, full_name: fullName.trim(), mobile }));

                // keep the stored user's display name in sync so the Topbar/Sidebar reflect the change too
                const storedUser = localStorage.getItem("user");
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    user.full_name = fullName.trim();
                    localStorage.setItem("user", JSON.stringify(user));
                }
            } else {
                setProfileError(response.message);
            }
        } catch (err) {
            setProfileError(err.response?.data?.message || "Unable to update profile.");
        } finally {
            setSavingProfile(false);
        }
    }

    async function handleChangePassword() {
        setPasswordError("");
        setPasswordSuccess("");

        if (!currentPassword || !newPassword || !confirmPassword) {
            setPasswordError("Please fill in all password fields.");
            return;
        }

        if (newPassword !== confirmPassword) {
            setPasswordError("New password and confirmation don't match.");
            return;
        }

        const problem = passwordProblem(newPassword, currentPassword);
        if (problem) {
            setPasswordError(problem);
            return;
        }

        try {
            setChangingPassword(true);
            const response = await changePassword({
                current_password: currentPassword,
                new_password: newPassword
            });

            if (response.success) {
                setPasswordSuccess("Password changed successfully.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setShowPw(false);
            } else {
                setPasswordError(response.message);
            }
        } catch (err) {
            setPasswordError(err.response?.data?.message || "Unable to change password.");
        } finally {
            setChangingPassword(false);
        }
    }

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
                <CircularProgress />
            </Box>
        );
    }

    const dirty = profile && (fullName !== (profile.full_name || "") || mobile !== (profile.mobile || ""));

    const mismatch = confirmPassword !== "" && newPassword !== confirmPassword;

    const details = [
        { icon: <MailIcon fontSize="small" />, label: "Email", value: profile?.email },
        { icon: <PhoneIcon fontSize="small" />, label: "Mobile", value: profile?.mobile },
        { icon: <SchoolIcon fontSize="small" />, label: "School", value: profile?.school }
    ];

    return (

        <Box sx={{ maxWidth: 900 }}>

            {/* ---------- banner ---------- */}
            <Box
                data-testid="profile-banner"
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    flexWrap: "wrap",
                    p: { xs: 2, sm: 3 },
                    mb: 2,
                    borderRadius: 4,
                    bgcolor: "var(--sl-banner, #4F46E5)",
                    color: "var(--sl-on-banner, #fff)",
                    border: "var(--sl-banner-border, none)",
                    boxShadow: "var(--sl-banner-shadow, none)"
                }}
            >
                <Avatar
                    sx={{
                        width: 72,
                        height: 72,
                        fontSize: "1.7rem",
                        fontWeight: 800,
                        bgcolor: "var(--sl-on-banner, #fff)",
                        color: "var(--sl-banner, #4F46E5)"
                    }}
                >
                    {initials(profile?.full_name)}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 200 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", sm: "1.55rem" }, lineHeight: 1.2 }}>
                        {profile ? profile.full_name : ""}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.75, flexWrap: "wrap" }}>
                        <Chip
                            size="small"
                            label={profile ? profile.role : ""}
                            sx={{ bgcolor: "var(--sl-on-banner, #fff)", color: "var(--sl-banner, #4F46E5)", fontWeight: 800 }}
                        />
                    </Box>
                </Box>
            </Box>

            {/* ---------- quick facts ---------- */}
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 1, mb: 2 }}>
                {details.map((d) => (
                    <Box
                        key={d.label}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.25,
                            p: 1.25,
                            borderRadius: 3,
                            bgcolor: "#fff",
                            border: "1px solid var(--sl-border, #E2E8F0)",
                            minWidth: 0
                        }}
                    >
                        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "var(--sl-soft, #EEF2FF)", color: "var(--sl-ink, #4F46E5)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {d.icon}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, letterSpacing: 0.4, color: "text.secondary" }}>{d.label.toUpperCase()}</Typography>
                            <Typography sx={{ fontSize: "0.88rem", fontWeight: 600 }} noWrap>{d.value || "-"}</Typography>
                        </Box>
                    </Box>
                ))}
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "start" }}>

                {/* ---------- edit details ---------- */}
                <Card sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "var(--sl-soft, #EEF2FF)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <PersonIcon fontSize="small" sx={{ color: "var(--sl-ink, #4F46E5)" }} />
                        </Box>
                        <Typography sx={{ fontWeight: 800, fontSize: "1.05rem" }}>Your details</Typography>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {profileError && <Alert severity="error">{profileError}</Alert>}
                        {profileSuccess && <Alert severity="success">{profileSuccess}</Alert>}

                        <TextField label="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} fullWidth />
                        <TextField label="Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} fullWidth />
                        <TextField
                            label="Email"
                            value={profile ? profile.email || "" : ""}
                            disabled
                            fullWidth
                            helperText="Email can't be changed here - contact your School Admin."
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button variant="contained" onClick={handleSaveProfile} disabled={savingProfile || !dirty}>
                                {savingProfile ? "Saving..." : "Save changes"}
                            </Button>
                        </Box>
                    </Box>
                </Card>

                {/* ---------- password ---------- */}
                <Card sx={{ p: { xs: 2, sm: 2.5 }, borderRadius: 3 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, mb: 2 }}>
                        <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: "#FFEDD5", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <LockIcon fontSize="small" sx={{ color: "#EA580C" }} />
                        </Box>
                        <Box>
                            <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", lineHeight: 1.2 }}>Password</Typography>
                            <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>Choose something only you know</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                        {passwordError && <Alert severity="error">{passwordError}</Alert>}
                        {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}

                        <PasswordField label="Current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} show={showPw} onToggle={() => setShowPw((v) => !v)} autoComplete="current-password" />
                        <PasswordField label="New password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} show={showPw} onToggle={() => setShowPw((v) => !v)} autoComplete="new-password" helperText="At least 8 characters, with a letter and a number." />
                        <PasswordField
                            label="Confirm new password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            show={showPw}
                            onToggle={() => setShowPw((v) => !v)}
                            autoComplete="new-password"
                            error={mismatch}
                            helperText={mismatch ? "Passwords don't match yet." : confirmPassword && newPassword === confirmPassword ? "Passwords match." : ""}
                        />

                        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                            <Button variant="contained" onClick={handleChangePassword} disabled={changingPassword || !currentPassword || !newPassword || !confirmPassword}>
                                {changingPassword ? "Updating..." : "Update password"}
                            </Button>
                        </Box>
                    </Box>
                </Card>

            </Box>

        </Box>

    );

}

export default ProfilePage;
