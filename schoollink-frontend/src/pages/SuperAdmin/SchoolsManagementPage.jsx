import { useEffect, useState } from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    Grid,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";

import DomainIcon from "@mui/icons-material/DomainOutlined";

import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import EditIcon from "@mui/icons-material/EditOutlined";

import {
    getAllSchools,
    updateSchoolGovernance
} from "../../services/superAdminService";

const statusOptions = ["ACTIVE", "SUSPENDED", "TRIAL", "EXPIRED"];

const planOptions = ["STANDARD", "PREMIUM", "TRIAL"];

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

function SchoolCard({ school, onSaved }) {

    const [editing, setEditing] = useState(false);

    const [plan, setPlan] = useState(school.subscription_plan || "STANDARD");

    const [status, setStatus] = useState(school.status || "ACTIVE");

    const [expiry, setExpiry] = useState(
        school.subscription_expiry
            ? school.subscription_expiry.slice(0, 10)
            : ""
    );

    const [maxClasses, setMaxClasses] = useState(school.max_classes ?? "");

    const [maxStudents, setMaxStudents] = useState(school.max_students ?? "");

    const [maxTeachers, setMaxTeachers] = useState(school.max_teachers ?? "");

    const [timezone, setTimezone] = useState(school.timezone || "Asia/Singapore");

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");

    async function handleSave() {

        setError("");

        try {

            setSaving(true);

            const response = await updateSchoolGovernance(school.id, {

                subscription_plan: plan,

                status,

                subscription_expiry: expiry || null,

                max_classes: maxClasses === "" ? null : Number(maxClasses),

                max_students: maxStudents === "" ? null : Number(maxStudents),

                max_teachers: maxTeachers === "" ? null : Number(maxTeachers),

                timezone

            });

            if (response.success) {

                setEditing(false);

                onSaved(response.data);

            } else {

                setError(response.message);

            }

        } catch (err) {

            setError(
                err.response?.data?.message ||
                "Unable to save changes."
            );

        } finally {

            setSaving(false);

        }

    }

    const statusColor =
        school.status === "ACTIVE" ? "success" :
        school.status === "SUSPENDED" ? "error" :
        school.status === "EXPIRED" ? "error" : "warning";

    return (

        <Card sx={{ p: 3, mb: 2 }}>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>

                    <Box

                        sx={{

                            width: 44,

                            height: 44,

                            borderRadius: "12px",

                            bgcolor: "#DBEAFE",

                            display: "flex",

                            alignItems: "center",

                            justifyContent: "center"

                        }}

                    >

                        <DomainIcon sx={{ color: "#2563EB" }} />

                    </Box>

                    <Box>

                        <Typography sx={{ fontWeight: 700 }}>

                            {school.school_name}

                        </Typography>

                        <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>

                            {school.school_code} · {school.city}, {school.country}

                        </Typography>

                    </Box>

                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>

                    <Chip size="small" label={school.subscription_plan || "STANDARD"} />

                    <Chip size="small" color={statusColor} label={school.status || "ACTIVE"} />

                    <Button
                        size="small"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => setEditing((v) => !v)}
                    >

                        {editing ? "Cancel" : "Manage"}

                    </Button>

                </Box>

            </Box>

            {editing && (

                <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #F1F5F9" }}>

                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    <Grid container spacing={2}>

                        <Grid item xs={12} sm={4}>

                            <TextField
                                select
                                label="Subscription Plan"
                                value={plan}
                                onChange={(e) => setPlan(e.target.value)}
                                fullWidth
                                size="small"
                            >

                                {planOptions.map((p) => (

                                    <MenuItem key={p} value={p}>{p}</MenuItem>

                                ))}

                            </TextField>

                        </Grid>

                        <Grid item xs={12} sm={4}>

                            <TextField
                                select
                                label="Status"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                fullWidth
                                size="small"
                            >

                                {statusOptions.map((s) => (

                                    <MenuItem key={s} value={s}>{s}</MenuItem>

                                ))}

                            </TextField>

                        </Grid>

                        <Grid item xs={12} sm={4}>

                            <SchoolDatePicker
                                label="Subscription Expiry"
                                value={expiry}
                                onChange={setExpiry}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                        <Grid item xs={12} sm={4}>

                            <TextField
                                label="Max Classes"
                                type="number"
                                placeholder="Unlimited"
                                value={maxClasses}
                                onChange={(e) => setMaxClasses(e.target.value)}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                        <Grid item xs={12} sm={4}>

                            <TextField
                                label="Max Students"
                                type="number"
                                placeholder="Unlimited"
                                value={maxStudents}
                                onChange={(e) => setMaxStudents(e.target.value)}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                        <Grid item xs={12} sm={4}>

                            <TextField
                                label="Max Teachers"
                                type="number"
                                placeholder="Unlimited"
                                value={maxTeachers}
                                onChange={(e) => setMaxTeachers(e.target.value)}
                                fullWidth
                                size="small"
                            />

                        </Grid>

                        <Grid item xs={12}>

                            <TextField
                                select
                                label="Timezone / Region"
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                fullWidth
                                size="small"
                                helperText="Controls how post/attendance times are displayed to this school's users"
                            >

                                {timezoneOptions.map((tz) => (

                                    <MenuItem key={tz.value} value={tz.value}>{tz.label}</MenuItem>

                                ))}

                            </TextField>

                        </Grid>

                    </Grid>

                    <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>

                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={saving}
                        >

                            {saving ? "Saving..." : "Save Changes"}

                        </Button>

                    </Box>

                </Box>

            )}

        </Card>

    );

}

function SchoolsManagementPage() {

    const [schools, setSchools] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadSchools();

    }, []);

    async function loadSchools() {

        try {

            const response = await getAllSchools();

            if (response.success) {

                setSchools(response.data);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoading(false);

        }

    }

    function handleSaved(updatedSchool) {

        setSchools((list) =>
            list.map((s) => (s.id === updatedSchool.id ? updatedSchool : s))
        );

    }

    if (loading) {

        return (

            <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>

                <CircularProgress />

            </Box>

        );

    }

    return (

        <Box sx={{ maxWidth: 900 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>

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

                    <DomainIcon sx={{ color: "#7C3AED" }} />

                </Box>

                <Box>

                    <Typography sx={{ color: "#7C3AED", fontWeight: 700, fontSize: "0.75rem", letterSpacing: 0.5, textTransform: "uppercase" }}>

                        Platform Console

                    </Typography>

                    <Typography variant="h5" sx={{ fontWeight: 700 }}>

                        Schools

                    </Typography>

                </Box>

            </Box>

            <Typography sx={{ color: "#64748B", mb: 3, ml: "56px" }}>

                Manage every school on the platform - subscriptions, status, and capacity limits.

            </Typography>

            {schools.length === 0 && (

                <Typography color="text.secondary">

                    No schools onboarded yet.

                </Typography>

            )}

            {schools.map((school) => (

                <SchoolCard key={school.id} school={school} onSaved={handleSaved} />

            ))}

        </Box>

    );

}

export default SchoolsManagementPage;
