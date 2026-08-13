import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Box,
    Button,
    Card,
    Divider,
    Grid,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import AddBusinessIcon from "@mui/icons-material/AddBusinessOutlined";

import { onboardSchool } from "../../services/platformService";

const timezoneOptions = [

    { value: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },

    { value: "Asia/Singapore", label: "Singapore (SGT, UTC+8)" },

    { value: "Asia/Dubai", label: "UAE (GST, UTC+4)" },

    { value: "Asia/Riyadh", label: "Saudi Arabia (AST, UTC+3)" },

    { value: "Asia/Kuala_Lumpur", label: "Malaysia (MYT, UTC+8)" },

    { value: "Asia/Jakarta", label: "Indonesia - Jakarta (WIB, UTC+7)" },

    { value: "Europe/London", label: "UK (GMT/BST)" },

    { value: "America/New_York", label: "US Eastern (ET)" }

];

const emptySchool = {

    school_name: "",
    school_code: "",
    city: "",
    country: "",
    timezone: "Asia/Singapore",
    subscription_plan: "STANDARD"

};

const emptyAdmin = {

    full_name: "",
    email: "",
    mobile: "",
    password: ""

};

function CreateSchoolPage() {

    const navigate = useNavigate();

    const [school, setSchool] = useState(emptySchool);

    const [admin, setAdmin] = useState(emptyAdmin);

    const [error, setError] = useState("");

    const [success, setSuccess] = useState("");

    const [saving, setSaving] = useState(false);

    async function handleCreate() {

        setError("");

        setSuccess("");

        if (!school.school_name || !school.school_code) {

            setError("School Name and School Code are required.");

            return;

        }

        if (!admin.full_name || !admin.email || !admin.mobile || !admin.password) {

            setError("All School Admin fields are required.");

            return;

        }

        try {

            setSaving(true);

            const response = await onboardSchool({ school, admin });

            if (response.success) {

                setSuccess(

                    `School "${response.data.school.school_name}" created, with admin account for ${response.data.administrator.email}.`

                );

                setSchool(emptySchool);

                setAdmin(emptyAdmin);

                setTimeout(() => {

                    navigate("/super-admin/schools");

                }, 1500);

            } else {

                setError(response.message);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to create this school."
            );

        } finally {

            setSaving(false);

        }

    }

    return (

        <Box sx={{ maxWidth: 700 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>

                <Box

                    sx={{

                        width: 40,

                        height: 40,

                        borderRadius: "10px",

                        bgcolor: "#EDE9FE",

                        display: "flex",

                        alignItems: "center",

                        justifyContent: "center"

                    }}

                >

                    <AddBusinessIcon sx={{ color: "#7C3AED" }} />

                </Box>

                <Typography variant="h5" sx={{ fontWeight: 700 }}>

                    Onboard New School

                </Typography>

            </Box>

            <Card sx={{ p: 3.5 }}>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Typography sx={{ fontWeight: 700, mb: 2 }}>School Details</Typography>

                <Grid container spacing={2} sx={{ mb: 3 }}>

                    <Grid size={{ xs: 12, sm: 6 }}>

                        <TextField
                            label="School Name"
                            value={school.school_name}
                            onChange={(e) => setSchool({ ...school, school_name: e.target.value })}
                            fullWidth
                            size="small"
                        />

                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>

                        <TextField
                            label="School Code"
                            placeholder="e.g. GIS001"
                            value={school.school_code}
                            onChange={(e) => setSchool({ ...school, school_code: e.target.value })}
                            fullWidth
                            size="small"
                        />

                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>

                        <TextField
                            label="City"
                            value={school.city}
                            onChange={(e) => setSchool({ ...school, city: e.target.value })}
                            fullWidth
                            size="small"
                        />

                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>

                        <TextField
                            label="Country"
                            value={school.country}
                            onChange={(e) => setSchool({ ...school, country: e.target.value })}
                            fullWidth
                            size="small"
                        />

                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>

                        <TextField
                            select
                            label="Timezone / Region"
                            value={school.timezone}
                            onChange={(e) => setSchool({ ...school, timezone: e.target.value })}
                            fullWidth
                            size="small"
                        >

                            {timezoneOptions.map((tz) => (

                                <MenuItem key={tz.value} value={tz.value}>{tz.label}</MenuItem>

                            ))}

                        </TextField>

                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>

                        <TextField
                            select
                            label="Subscription Plan"
                            value={school.subscription_plan}
                            onChange={(e) => setSchool({ ...school, subscription_plan: e.target.value })}
                            fullWidth
                            size="small"
                        >

                            <MenuItem value="STANDARD">STANDARD</MenuItem>

                            <MenuItem value="PREMIUM">PREMIUM</MenuItem>

                            <MenuItem value="TRIAL">TRIAL</MenuItem>

                        </TextField>

                    </Grid>

                </Grid>

                <Divider sx={{ mb: 3 }} />

                <Typography sx={{ fontWeight: 700, mb: 2 }}>School Administrator</Typography>

                <Grid container spacing={2}>

                    <Grid size={{ xs: 12, sm: 6 }}>

                        <TextField
                            label="Full Name"
                            value={admin.full_name}
                            onChange={(e) => setAdmin({ ...admin, full_name: e.target.value })}
                            fullWidth
                            size="small"
                        />

                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>

                        <TextField
                            label="Email"
                            value={admin.email}
                            onChange={(e) => setAdmin({ ...admin, email: e.target.value })}
                            fullWidth
                            size="small"
                        />

                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>

                        <TextField
                            label="Mobile"
                            value={admin.mobile}
                            onChange={(e) => setAdmin({ ...admin, mobile: e.target.value })}
                            fullWidth
                            size="small"
                        />

                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>

                        <TextField
                            label="Temporary Password"
                            type="password"
                            value={admin.password}
                            onChange={(e) => setAdmin({ ...admin, password: e.target.value })}
                            fullWidth
                            size="small"
                        />

                    </Grid>

                </Grid>

                <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}>

                    <Button onClick={() => navigate("/super-admin/schools")}>Cancel</Button>

                    <Button variant="contained" onClick={handleCreate} disabled={saving}>

                        {saving ? "Creating..." : "Create School"}

                    </Button>

                </Box>

            </Card>

        </Box>

    );

}

export default CreateSchoolPage;
