import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Container,
    Alert,
    TextField,
    Typography
} from "@mui/material";

import { login } from "../../services/authService";

function LoginPage() {

    const navigate = useNavigate();

    const [email, setEmail] = useState("");

    const [password, setPassword] = useState("");

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

            console.log("Login Response:", response);

            if (response.success) {

                // Save JWT
                localStorage.setItem(
                    "token",
                    response.token
                );

                // Save logged in user
                localStorage.setItem(
                    "user",
                    JSON.stringify(response.user)
                );

                console.log("Login Successful");

                // Redirect to Dashboard
                navigate("/dashboard");

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

    return (

        <Container maxWidth="sm">

            <Box

                sx={{

                    display: "flex",

                    justifyContent: "center",

                    alignItems: "center",

                    height: "100vh"

                }}

            >

                <Card

                    sx={{

                        width: "100%",

                        p: 2,

                        borderRadius: 3,

                        boxShadow: 6

                    }}

                >

                    <CardContent>

                        <Typography

                            variant="h4"

                            align="center"

                            gutterBottom

                        >

                            SchoolLink ERP

                        </Typography>

                        <Typography

                            align="center"

                            color="text.secondary"

                            mb={3}

                        >

                            Welcome Back

                        </Typography>

                        {

                            error && (

                                <Alert

                                    severity="error"

                                    sx={{ mb: 2 }}

                                >

                                    {error}

                                </Alert>

                            )

                        }

                        <TextField

                            fullWidth

                            label="Email"

                            margin="normal"

                            value={email}

                            onChange={(e) =>
                                setEmail(e.target.value)
                            }

                        />

                        <TextField

                            fullWidth

                            type="password"

                            label="Password"

                            margin="normal"

                            value={password}

                            onChange={(e) =>
                                setPassword(e.target.value)
                            }

                        />

                        <Button

                            fullWidth

                            variant="contained"

                            sx={{

                                mt: 3,

                                py: 1.5

                            }}

                            onClick={handleLogin}

                            disabled={loading}

                        >

                            {

                                loading

                                    ?

                                    <CircularProgress

                                        color="inherit"

                                        size={24}

                                    />

                                    :

                                    "Login"

                            }

                        </Button>

                    </CardContent>

                </Card>

            </Box>

        </Container>

    );

}

export default LoginPage;