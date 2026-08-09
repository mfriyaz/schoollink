import { useEffect, useState } from "react";

import {
    Alert,
    Avatar,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Divider,
    TextField,
    Typography
} from "@mui/material";

import PersonIcon from "@mui/icons-material/PersonOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";

import {
    getMyProfile,
    updateMyProfile,
    changePassword
} from "../../services/profileService";

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

        if (!fullName) {

            setProfileError("Full name is required.");

            return;

        }

        try {

            setSavingProfile(true);

            const response = await updateMyProfile({

                full_name: fullName,

                mobile

            });

            if (response.success) {

                setProfileSuccess("Profile updated successfully.");

                // Keep the stored user's display name in sync
                // so the Topbar/Sidebar reflect the change too.
                const storedUser = localStorage.getItem("user");

                if (storedUser) {

                    const user = JSON.parse(storedUser);

                    user.full_name = fullName;

                    localStorage.setItem("user", JSON.stringify(user));

                }

            } else {

                setProfileError(response.message);

            }

        } catch (err) {

            setProfileError(
                err.response?.data?.message ||
                "Unable to update profile."
            );

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

            } else {

                setPasswordError(response.message);

            }

        } catch (err) {

            setPasswordError(
                err.response?.data?.message ||
                "Unable to change password."
            );

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

    return (

        <Box sx={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: 3 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                <Avatar sx={{ width: 56, height: 56, bgcolor: "#2563EB", fontSize: "1.4rem" }}>

                    {profile && profile.full_name ? profile.full_name[0] : "?"}

                </Avatar>

                <Box>

                    <Typography variant="h5" sx={{ fontWeight: 700 }}>

                        {profile ? profile.full_name : ""}

                    </Typography>

                    <Chip
                        size="small"
                        label={profile ? profile.role : ""}
                        sx={{ mt: 0.5 }}
                    />

                </Box>

            </Box>

            <Card sx={{ p: 3.5 }}>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>

                    <PersonIcon sx={{ color: "#2563EB" }} />

                    <Typography variant="h6" sx={{ fontWeight: 700 }}>

                        Profile Details

                    </Typography>

                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                    {profileError && <Alert severity="error">{profileError}</Alert>}

                    {profileSuccess && <Alert severity="success">{profileSuccess}</Alert>}

                    <TextField
                        label="Full Name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Mobile"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Email"
                        value={profile ? profile.email : ""}
                        disabled
                        fullWidth
                        helperText="Email can't be changed here - contact your School Admin."
                    />

                    <TextField
                        label="School"
                        value={profile ? profile.school || "-" : ""}
                        disabled
                        fullWidth
                    />

                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>

                        <Button
                            variant="contained"
                            onClick={handleSaveProfile}
                            disabled={savingProfile}
                        >

                            {savingProfile ? "Saving..." : "Save Changes"}

                        </Button>

                    </Box>

                </Box>

            </Card>

            <Card sx={{ p: 3.5 }}>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>

                    <LockIcon sx={{ color: "#EA580C" }} />

                    <Typography variant="h6" sx={{ fontWeight: 700 }}>

                        Change Password

                    </Typography>

                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>

                    {passwordError && <Alert severity="error">{passwordError}</Alert>}

                    {passwordSuccess && <Alert severity="success">{passwordSuccess}</Alert>}

                    <TextField
                        label="Current Password"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        fullWidth
                    />

                    <Divider />

                    <TextField
                        label="New Password"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Confirm New Password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        fullWidth
                    />

                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>

                        <Button
                            variant="contained"
                            color="warning"
                            onClick={handleChangePassword}
                            disabled={changingPassword}
                        >

                            {changingPassword ? "Updating..." : "Update Password"}

                        </Button>

                    </Box>

                </Box>

            </Card>

        </Box>

    );

}

export default ProfilePage;
