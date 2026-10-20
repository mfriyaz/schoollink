import { useEffect, useState } from "react";
import { notify } from "../../utils/notify";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
        CircularProgress,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Grid,
    InputAdornment,
    LinearProgress,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import DomainIcon from "@mui/icons-material/DomainOutlined";
import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import EditIcon from "@mui/icons-material/EditOutlined";
import SearchIcon from "@mui/icons-material/SearchOutlined";
import { updateSchoolGovernance } from "../../services/superAdminService";
import { getPlatformSchools } from "../../services/platformAdminService";
import { bytesLabel, changeLines, fmtDate, timeAgo } from "../../utils/platformUi";
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
    const navigate = useNavigate();
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
    const [maxStorage, setMaxStorage] = useState(school.max_storage_mb ?? "");
    const [timezone, setTimezone] = useState(school.timezone || "Asia/Singapore");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pending, setPending] = useState([]);
    const [reason, setReason] = useState("");
    const current = {
        subscription_plan: school.subscription_plan || "STANDARD",
        status: school.status || "ACTIVE",
        subscription_expiry: school.subscription_expiry ? String(school.subscription_expiry).slice(0, 10) : null,
        max_students: school.max_students ?? null,
        max_teachers: school.max_teachers ?? null,
        max_classes: school.max_classes ?? null,
        max_storage_mb: school.max_storage_mb ?? null
    };
    const next = {
        subscription_plan: plan,
        status,
        subscription_expiry: expiry || null,
        max_students: maxStudents === "" ? null : Number(maxStudents),
        max_teachers: maxTeachers === "" ? null : Number(maxTeachers),
        max_classes: maxClasses === "" ? null : Number(maxClasses),
        max_storage_mb: maxStorage === "" ? null : Number(maxStorage)
    };
    const expiryChanged = current.subscription_expiry !== next.subscription_expiry;
    // Step 1: show exactly what is about to change and ask to confirm
    function requestSave() {
        setError("");
        const changes = {};
        for (const k of Object.keys(next)) {
            const a = current[k] === null ? null : String(current[k]);
            const b = next[k] === null ? null : String(next[k]);
            if (a !== b) changes[k] = { from: current[k], to: next[k] };
        }
        const lines = changeLines(changes);
        const tzChanged = timezone !== (school.timezone || "Asia/Singapore");
        if (lines.length === 0 && !tzChanged) {
            setError("Nothing has changed.");
            return;
        }
        if (tzChanged) {
            lines.push({ field: "timezone", label: "Time zone", from: school.timezone || "-", to: timezone });
        }
        setPending(lines);
        setReason("");
        setConfirmOpen(true);
    }
    // Step 2: confirmed - save, with the reason kept in the change history
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
                max_storage_mb: maxStorage === "" ? null : Number(maxStorage),
                timezone,
                reason
            });
            if (response.success) {
                setConfirmOpen(false);
                setEditing(false);
                notify("School settings updated.");
                onSaved(response.data);
            } else {
                setError(response.message);
                setConfirmOpen(false);
            }
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Unable to save changes."
            );
            setConfirmOpen(false);
        } finally {
            setSaving(false);
        }
    }
    const expiryDays = school.subscription_expiry
        ? Math.round((new Date(`${String(school.subscription_expiry).slice(0, 10)}T00:00:00`) - new Date(new Date().toDateString())) / 86400000)
        : null;
    const statusColor =
        school.status === "ACTIVE" ? "success" :
        school.status === "SUSPENDED" ? "error" :
        school.status === "EXPIRED" ? "error" : "warning";
    return (
        <Card sx={{ border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)", borderRadius: 3, p: { xs: 2, sm: 3 }, mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: "13px",
                            bgcolor: "var(--sl-accent)",
                            border: "1.5px solid var(--sl-ink)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}
                    >
                        <DomainIcon sx={{ color: "var(--sl-ink)" }} />
                    </Box>
                    <Box>
                        <Typography sx={{ fontWeight: 800, color: "var(--sl-ink)" }}>
                            {school.school_name}
                        </Typography>
                        <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
                            {school.school_code} · {school.city}, {school.country}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>
                    <Chip size="small" label={school.subscription_plan || "STANDARD"} />
                    <Chip size="small" color={statusColor} label={school.status || "ACTIVE"} />
                    <Button size="small" onClick={() => navigate(`/super-admin/schools/${school.id}`)}>
                        Details
                    </Button>
                    <Button
                        size="small"
                        startIcon={<EditIcon fontSize="small" />}
                        onClick={() => setEditing((v) => !v)}
                    >
                        {editing ? "Cancel" : "Manage"}
                    </Button>
                </Box>
            </Box>
                        <Box sx={{ mt: 2 }}>
                <Grid container spacing={1.5}>
                    {[
                        ["Students", school.students, school.max_students, null],
                        ["Teachers", school.teachers, school.max_teachers, null],
                        ["Classes", school.classes, school.max_classes, null],
                        ["Parents", school.parents, null, null],
                        ["Storage", bytesLabel(school.storage_bytes), school.max_storage_mb ? `${school.max_storage_mb} MB` : null, school.max_storage_mb ? (school.storage_bytes / 1048576 / school.max_storage_mb) * 100 : null]
                    ].map(([label, used, limit, pctOverride]) => {
                        const pct = pctOverride !== null ? pctOverride : (limit && typeof used === "number" ? (used / limit) * 100 : null);
                        return (
                            <Grid key={label} size={{ xs: 6, sm: 4, md: 2.4 }}>
                                <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: "#F8FAFC", height: "100%" }}>
                                    <Typography sx={{ color: "#94A3B8", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</Typography>
                                    <Typography sx={{ fontWeight: 700, fontSize: "1.05rem", lineHeight: 1.3 }}>
                                        {used}{limit ? <span style={{ color: "#94A3B8", fontWeight: 500, fontSize: "0.8rem" }}> / {limit}</span> : null}
                                    </Typography>
                                    {pct !== null && (
                                        <LinearProgress variant="determinate" value={Math.min(100, pct)}
                                            color={pct >= 100 ? "error" : pct >= 90 ? "warning" : "primary"}
                                            sx={{ height: 5, borderRadius: 3, mt: 0.5, bgcolor: "#E2E8F0" }} />
                                    )}
                                </Box>
                            </Grid>
                        );
                    })}
                </Grid>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mt: 1.5, alignItems: "center" }}>
                    {expiryDays === null ? (
                        <Chip size="small" variant="outlined" label="No expiry set" />
                    ) : (
                        <Chip size="small" color={expiryDays < 0 ? "error" : expiryDays <= 30 ? "warning" : "success"} variant="outlined"
                            label={expiryDays < 0
                                ? `Expired ${-expiryDays} day${-expiryDays === 1 ? "" : "s"} ago (${fmtDate(school.subscription_expiry)})`
                                : `Expires ${fmtDate(school.subscription_expiry)} (${expiryDays} day${expiryDays === 1 ? "" : "s"} left)`} />
                    )}
                    <Chip size="small" variant="outlined" label={`Last login: ${timeAgo(school.last_login)}`} />
                    {school.files > 0 && <Chip size="small" variant="outlined" label={`${school.files} files`} />}
                </Box>
                <Typography sx={{ color: "#64748B", fontSize: "0.8rem", mt: 1, overflowWrap: "anywhere" }}>
                    Admin: {school.admin_name ? `${school.admin_name}${school.admin_email ? ` - ${school.admin_email}` : ""}` : "no administrator found"}
                    {school.phone ? ` | Phone: ${school.phone}` : ""}
                </Typography>
            </Box>
            {editing && (
                <Box sx={{ mt: 3, pt: 3, borderTop: "1px solid #F1F5F9" }}>
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                    <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 4 }}>
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
                        <Grid size={{ xs: 12, sm: 4 }}>
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
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <SchoolDatePicker
                                label="Subscription Expiry"
                                value={expiry}
                                onChange={setExpiry}
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 4 }}>
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
                        <Grid size={{ xs: 12, sm: 4 }}>
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
                        <Grid size={{ xs: 12, sm: 4 }}>
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
                        <Grid size={{ xs: 12, sm: 4 }}>
                            <TextField
                                label="Max Storage (MB)"
                                type="number"
                                placeholder="Unlimited"
                                value={maxStorage}
                                onChange={(e) => setMaxStorage(e.target.value)}
                                helperText="Photos, voice notes and files. 1024 MB = 1 GB"
                                fullWidth
                                size="small"
                            />
                        </Grid>
                        <Grid size={{ xs: 12 }}>
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
                        <Button loading={saving} loadingPosition="start"
                            variant="contained"
                            onClick={requestSave} disabled={saving} >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </Box>
                </Box>
            )}
                    <Dialog open={confirmOpen} onClose={saving ? undefined : () => setConfirmOpen(false)} maxWidth="xs" fullWidth>
                <DialogTitle>Confirm changes for {school.school_name}</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "0.88rem", mb: 1.5 }}>
                        Please check these changes. They are saved in the school's change history.
                    </Typography>
                    {pending.map((c) => (
                        <Typography key={c.field} sx={{ fontSize: "0.9rem", mb: 0.5 }}>
                            <span style={{ color: "#64748B" }}>{c.label}:</span> {c.from} <b>→</b> <b>{c.to}</b>
                        </Typography>
                    ))}
                    <TextField
                        label={expiryChanged ? "Reason (required - expiry date is changing)" : "Reason (optional)"}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        fullWidth size="small" multiline minRows={2} sx={{ mt: 2 }}
                        error={expiryChanged && !reason.trim()}
                        placeholder="e.g. Renewed for 1 year, paid by UPI"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmOpen(false)} disabled={saving}>Cancel</Button>
                    <Button variant="contained" onClick={handleSave} loading={saving} loadingPosition="start"
                        disabled={expiryChanged && !reason.trim()}>
                        Confirm and save
                    </Button>
                </DialogActions>
            </Dialog>
        </Card>
    );
}
function SchoolsManagementPage() {
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    useEffect(() => {
        loadSchools();
    }, []);
    async function loadSchools() {
        try {
            const response = await getPlatformSchools();
            if (response.success) {
                setSchools(response.data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }
    function handleSaved() {
        // Reload so usage, expiry countdown and limits all refresh together
        loadSchools();
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
                        width: 46, height: 46, minWidth: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}
                >
                    <DomainIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box>
                    <Typography sx={{ color: "#7C3AED", fontWeight: 700, fontSize: "0.75rem", letterSpacing: 0.5, textTransform: "uppercase" }}>
                        Platform Console
                    </Typography>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>
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
                        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2, alignItems: "center" }}>
                <TextField
                    size="small" placeholder="Search school name, code or city" value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    sx={{ flex: 1, minWidth: 220, maxWidth: 360 }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }}
                />
                {["ALL", "ACTIVE", "TRIAL", "SUSPENDED", "EXPIRED"].map((st) => (
                    <Box key={st} role="button" tabIndex={0} onClick={() => setStatusFilter(st)}
                        sx={{ px: 1.5, py: 0.55, borderRadius: 99, cursor: "pointer", userSelect: "none", fontSize: "0.8rem", fontWeight: 700, color: "var(--sl-ink)", border: "1.5px solid var(--sl-ink)", bgcolor: statusFilter === st ? "var(--sl-accent)" : "transparent", "&:hover": { bgcolor: statusFilter === st ? undefined : "var(--sl-soft)" } }}>
                        {st === "ALL" ? `All (${schools.length})` : `${st} (${schools.filter((x) => x.status === st).length})`}
                    </Box>
                ))}
            </Box>
            {schools
                .filter((x) => statusFilter === "ALL" || x.status === statusFilter)
                .filter((x) => !search.trim() || `${x.school_name} ${x.school_code} ${x.city || ""}`.toLowerCase().includes(search.trim().toLowerCase()))
                .map((school) => (
                    <SchoolCard key={school.id} school={school} onSaved={handleSaved} />
                ))}
        </Box>
    );
}
export default SchoolsManagementPage;
