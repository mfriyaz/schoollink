import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Button,
    Checkbox,
    CircularProgress,
    Alert,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Link,
    TextField,
    Typography
} from "@mui/material";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOffOutlined";
import { login } from "../../services/authService";
function SchoolIllustration() {
    const ink = "var(--sl-ink, #111827)";
    const acc = "var(--sl-accent, #FFC400)";
    const soft = "var(--sl-soft, #FFF4C2)";
    return (
        <svg viewBox="0 0 320 260" width="100%" style={{ maxWidth: 300 }}>
            <ellipse cx="160" cy="226" rx="150" ry="20" fill={ink} opacity="0.12" />
            <rect x="70" y="70" width="180" height="120" rx="10" fill="#FFFFFF" stroke={ink} strokeWidth="3" />
            <polygon points="58,76 160,24 262,76" fill={acc} stroke={ink} strokeWidth="3" strokeLinejoin="round" />
            <rect x="140" y="140" width="40" height="50" rx="5" fill={acc} stroke={ink} strokeWidth="3" />
            <rect x="90" y="95" width="30" height="30" rx="5" fill={soft} stroke={ink} strokeWidth="2.5" />
            <rect x="200" y="95" width="30" height="30" rx="5" fill={soft} stroke={ink} strokeWidth="2.5" />
            <rect x="90" y="140" width="30" height="30" rx="5" fill={soft} stroke={ink} strokeWidth="2.5" />
            <rect x="200" y="140" width="30" height="30" rx="5" fill={soft} stroke={ink} strokeWidth="2.5" />
            <line x1="160" y1="24" x2="160" y2="4" stroke={ink} strokeWidth="3" />
            <polygon points="160,4 180,10 160,16" fill="#EF4444" stroke={ink} strokeWidth="2" />
            <circle cx="105" cy="205" r="10" fill="#FBCFE8" stroke={ink} strokeWidth="2.5" />
            <rect x="95" y="215" width="20" height="35" rx="8" fill="#F472B6" stroke={ink} strokeWidth="2.5" />
            <circle cx="160" cy="215" r="8" fill="#FDE68A" stroke={ink} strokeWidth="2.5" />
            <rect x="151" y="223" width="18" height="27" rx="7" fill="#34D399" stroke={ink} strokeWidth="2.5" />
            <circle cx="215" cy="205" r="10" fill="#FDE68A" stroke={ink} strokeWidth="2.5" />
            <rect x="205" y="215" width="20" height="35" rx="8" fill="#38BDF8" stroke={ink} strokeWidth="2.5" />
        </svg>
    );
}
function LoginPage() {
    const navigate = useNavigate();
    const [identifier, setIdentifier] = useState("");
    const [showForgotHint, setShowForgotHint] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(() => {
        try {
            const notice = sessionStorage.getItem("login_notice");
            if (notice) sessionStorage.removeItem("login_notice");
            return notice || "";
        } catch {
            return "";
        }
    });
    const handleLogin = async () => {
        setError("");
        if (!identifier || !password) {
            setError("Please enter your email/username and password.");
            return;
        }
        try {
            setLoading(true);
            const response = await login(identifier, password, rememberMe);
            if (response.success) {
                localStorage.setItem("token", response.token);
                localStorage.setItem("user", JSON.stringify(response.user));
                if (response.user.role === "Teacher") {
                    navigate("/teacher/dashboard");
                } else if (response.user.role === "Parent") {
                    navigate("/parent/dashboard");
                } else if (response.user.role === "Super Admin") {
                    navigate("/super-admin/schools");
                } else {
                    navigate("/dashboard");
                }
            } else {
                setError(response.message);
            }
        } catch (err) {
            console.error(err);
            setError(
                err.response?.data?.message ||
                "Unable to login."
            );
        } finally {
            setLoading(false);
        }
    };
    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    };
    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: "var(--sl-login-bg)",
                display: "flex",
                flexDirection: "column"
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: { xs: 3, md: 4 } }}>
                <Box
                    sx={{
                        width: 42,
                        height: 42,
                        borderRadius: "13px",
                        bgcolor: "var(--sl-accent, #FFC400)",
                        border: "1.5px solid var(--sl-ink, #111827)",
                        boxShadow: "2px 2px 0 var(--sl-ink, #111827)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <MenuBookIcon sx={{ color: "var(--sl-ink, #111827)", fontSize: 22 }} />
                </Box>
                <Typography sx={{ fontWeight: 800, fontSize: "1.25rem", color: "var(--sl-ink, #111827)" }}>
                    SchoolLink
                </Typography>
            </Box>
            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    px: { xs: 3, md: 8 },
                    pb: 6
                }}
            >
                <Box
                    sx={{
                        display: { xs: "none", md: "flex" },
                        flex: 1,
                        maxWidth: 480,
                        background: "var(--sl-soft, #FFF4C2)",
                        border: "1.5px solid var(--sl-ink, #111827)",
                        boxShadow: "6px 6px 0 var(--sl-ink, #111827)",
                        borderRadius: 6,
                        p: 6,
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: 3
                    }}
                >
                    <SchoolIllustration />
                    <Typography variant="h5" sx={{ fontWeight: 800, color: "var(--sl-ink, #111827)" }}>
                        Stronger Connection
                        <br />
                        Better Education
                    </Typography>
                    <Typography sx={{ color: "var(--sl-ink, #111827)", opacity: 0.75 }}>
                        Together for a better tomorrow
                    </Typography>
                </Box>
                <Box sx={{
                    width: "100%", maxWidth: 400, bgcolor: "#fff", p: { xs: 2.5, sm: 3.5 }, borderRadius: 4,
                    border: "1.5px solid var(--sl-ink, #111827)", boxShadow: "5px 5px 0 var(--sl-ink, #111827)"
                }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.6rem", md: "1.9rem" }, mb: 0.5, color: "var(--sl-ink, #111827)" }}>
                        Welcome Back!
                    </Typography>
                    <Typography sx={{ color: "text.secondary", mb: 2.5 }}>
                        Login to your SchoolLink account
                    </Typography>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <TextField
                        fullWidth
                        label="Email or Username"
                        margin="normal"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    <TextField
                        fullWidth
                        type={showPassword ? "text" : "password"}
                        label="Password"
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={handleKeyDown}
                        slotProps={{
                            input: {
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }
                        }}
                    />
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 1,
                            mb: 3
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                />
                            }
                            label={
                                <Typography sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                                    Remember me
                                </Typography>
                            }
                        />
                        <Link
                            underline="hover"
                            sx={{ fontSize: "0.85rem", cursor: "pointer", fontWeight: 700, color: "var(--sl-ink, #111827)" }} onClick={() => setShowForgotHint((v) => !v)} > Forgot Password? </Link>
                    </Box>
{showForgotHint && (<Alert severity="info" sx={{ mb: 2 }}>Please contact your school admin - they can reset your password and give you a new temporary one. After logging in, change it under Profile.</Alert>)}
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ py: 1.4, fontWeight: 800, fontSize: "1rem" }}
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress color="inherit" size={24} /> : "Login"}
                    </Button>
                    <Typography
                        sx={{
                            textAlign: "center",
                            color: "text.secondary",
                            fontSize: "0.8rem",
                            mt: 3
                        }}
                    >
                        © 2026 SchoolLink. All rights reserved.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
export default LoginPage;
