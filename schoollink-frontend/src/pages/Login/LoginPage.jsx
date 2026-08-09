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

    return (

        <svg viewBox="0 0 320 260" width="100%" style={{ maxWidth: 300 }}>

            {/* sky blob */}
            <ellipse cx="160" cy="220" rx="150" ry="24" fill="#BFDBFE" opacity="0.6" />

            {/* school building */}
            <rect x="70" y="70" width="180" height="120" rx="8" fill="#FFFFFF" stroke="#93C5FD" strokeWidth="3" />

            <polygon points="60,75 160,25 260,75" fill="#2563EB" />

            {/* door */}
            <rect x="140" y="140" width="40" height="50" rx="4" fill="#2563EB" />

            {/* windows */}
            <rect x="90" y="95" width="30" height="30" rx="4" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />
            <rect x="200" y="95" width="30" height="30" rx="4" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />
            <rect x="90" y="140" width="30" height="30" rx="4" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />
            <rect x="200" y="140" width="30" height="30" rx="4" fill="#DBEAFE" stroke="#93C5FD" strokeWidth="2" />

            {/* flag */}
            <line x1="160" y1="25" x2="160" y2="5" stroke="#1E3A8A" strokeWidth="2" />
            <polygon points="160,5 178,10 160,15" fill="#F59E0B" />

            {/* mother */}
            <circle cx="105" cy="205" r="10" fill="#1E3A8A" />
            <rect x="95" y="215" width="20" height="35" rx="8" fill="#2563EB" />

            {/* child */}
            <circle cx="160" cy="215" r="8" fill="#1E3A8A" />
            <rect x="151" y="223" width="18" height="27" rx="7" fill="#F59E0B" />

            {/* father */}
            <circle cx="215" cy="205" r="10" fill="#1E3A8A" />
            <rect x="205" y="215" width="20" height="35" rx="8" fill="#1D4ED8" />

        </svg>

    );

}

function LoginPage() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const handleLogin = async () => {

        setError("");

        if (!email || !password) {

            setError("Please enter email and password.");

            return;

        }

        try {

            setLoading(true);

            const response = await login(email, password);

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

                bgcolor: "#F8FAFC",

                display: "flex",

                flexDirection: "column"

            }}

        >

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, p: { xs: 3, md: 4 } }}>

                <Box

                    sx={{

                        width: 36,

                        height: 36,

                        borderRadius: "10px",

                        bgcolor: "#2563EB",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center"

                    }}

                >

                    <MenuBookIcon sx={{ color: "white", fontSize: 20 }} />

                </Box>

                <Typography variant="h6" sx={{ fontWeight: 700 }}>

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

                        bgcolor: "#DBEAFE",

                        borderRadius: 6,

                        p: 6,

                        flexDirection: "column",

                        alignItems: "center",

                        textAlign: "center",

                        gap: 3

                    }}

                >

                    <SchoolIllustration />

                    <Typography variant="h5" sx={{ fontWeight: 700, color: "#1E3A8A" }}>

                        Stronger Connection
                        <br />
                        Better Education

                    </Typography>

                    <Typography sx={{ color: "#3B5A9A" }}>

                        Together for a better tomorrow

                    </Typography>

                </Box>

                <Box sx={{ width: "100%", maxWidth: 380 }}>

                    <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5 }}>

                        Welcome Back!

                    </Typography>

                    <Typography sx={{ color: "#64748B", mb: 4 }}>

                        Login to your SchoolLink account

                    </Typography>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <TextField
                        fullWidth
                        label="Email"
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
                        InputProps={{

                            endAdornment: (

                                <InputAdornment position="end">

                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                    >

                                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}

                                    </IconButton>

                                </InputAdornment>

                            )

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
                            control={<Checkbox size="small" />}
                            label={

                                <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>

                                    Remember me

                                </Typography>

                            }
                        />

                        <Link

                            underline="hover"

                            sx={{ fontSize: "0.85rem", cursor: "pointer" }}

                        >

                            Forgot Password?

                        </Link>

                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ py: 1.5 }}
                        onClick={handleLogin}
                        disabled={loading}
                    >

                        {loading ? <CircularProgress color="inherit" size={24} /> : "Login"}

                    </Button>

                    <Typography

                        sx={{

                            textAlign: "center",

                            color: "#94A3B8",

                            fontSize: "0.8rem",

                            mt: 4

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
