import { useEffect, useState } from "react";
import { notify } from "../../utils/notify";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
        IconButton,
        ListItemIcon,
        Menu,
        Skeleton,
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
import MoreIcon from "@mui/icons-material/MoreVert";
import OpenIcon from "@mui/icons-material/OpenInNewOutlined";
import PayIcon from "@mui/icons-material/PaymentsOutlined";
import PageHeader from "../../components/common/PageHeader";
import PaymentDialog from "../../components/SuperAdmin/PaymentDialog";
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
    const [menuEl, setMenuEl] = useState(null);
    const [payOpen, setPayOpen] = useState(false);
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
    const stuPct = school.max_students ? Math.min(100, Math.round((school.students / school.max_students) * 100)) : null;
    const expiryText = expiryDays === null ? "No expiry" : expiryDays < 0 ? `Expired ${-expiryDays}d ago` : `${expiryDays}d left`;
    const expiryTone = expiryDays === null ? "#64748B" : expiryDays < 0 ? "#DC2626" : expiryDays <= 30 ? "#B45309" : "#15803D";
    const open = () => navigate(`/super-admin/schools/${school.id}`);
    return (
        <Card sx={{ border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)", borderRadius: 3, mb: 1.25, overflow: "visible" }}>
            <Box
                onClick={open}
                sx={{
                    display: "grid", alignItems: "center", gap: { xs: 1, md: 2 }, p: { xs: 1.5, sm: 2 }, cursor: "pointer",
                    gridTemplateColumns: { xs: "40px minmax(0,1fr) 36px", md: "40px minmax(0,2.2fr) minmax(0,1.3fr) minmax(0,1.1fr) minmax(0,1fr) 36px" },
                    "&:hover": { bgcolor: "var(--sl-soft)" }
                }}
            >
                <Box sx={{ width: 40, height: 40, borderRadius: "12px", bgcolor: "var(--sl-accent)", color: "var(--sl-ink)", border: "1.5px solid var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                    {(school.school_name || "S").charAt(0).toUpperCase()}
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, color: "var(--sl-ink)", fontSize: "0.95rem" }} noWrap>{school.school_name}</Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, flexWrap: "wrap", mt: 0.25 }}>
                        <Chip size="small" label={school.subscription_plan || "STANDARD"} sx={{ height: 20, fontSize: "0.68rem" }} />
                        <Chip size="small" color={statusColor} label={school.status || "ACTIVE"} sx={{ height: 20, fontSize: "0.68rem" }} />
                        <Typography sx={{ color: "#64748B", fontSize: "0.74rem" }} noWrap>{school.school_code}{school.city ? ` · ${school.city}` : ""}</Typography>
                    </Box>
                    <Box sx={{ display: { xs: "block", md: "none" }, mt: 0.75 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "0.74rem", color: "#64748B", mb: 0.3 }}>
                            <span>Students {school.students}{school.max_students ? ` / ${school.max_students}` : ""}</span>
                            <span style={{ color: expiryTone, fontWeight: 700 }}>{expiryText}</span>
                        </Box>
                        {stuPct !== null && <LinearProgress variant="determinate" value={stuPct} color={stuPct >= 100 ? "error" : stuPct >= 90 ? "warning" : "primary"} sx={{ height: 5, borderRadius: 3, bgcolor: "#E2E8F0" }} />}
                        <Typography sx={{ color: "#94A3B8", fontSize: "0.7rem", mt: 0.4 }}>Last login: {timeAgo(school.last_login)}</Typography>
                    </Box>
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700 }}>{school.students}{school.max_students ? <span style={{ color: "#94A3B8", fontWeight: 500 }}> / {school.max_students}</span> : ""} students</Typography>
                    {stuPct !== null && <LinearProgress variant="determinate" value={stuPct} color={stuPct >= 100 ? "error" : stuPct >= 90 ? "warning" : "primary"} sx={{ height: 6, borderRadius: 3, mt: 0.5, bgcolor: "#E2E8F0" }} />}
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <Typography sx={{ fontSize: "0.8rem", fontWeight: 700, color: expiryTone }}>{expiryText}</Typography>
                    <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{school.subscription_expiry ? fmtDate(school.subscription_expiry) : "-"}</Typography>
                </Box>
                <Box sx={{ display: { xs: "none", md: "block" } }}>
                    <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>Last login</Typography>
                    <Typography sx={{ fontSize: "0.8rem" }}>{timeAgo(school.last_login)}</Typography>
                </Box>
                <IconButton size="small" aria-label="School actions" onClick={(e) => { e.stopPropagation(); setMenuEl(e.currentTarget); }}>
                    <MoreIcon />
                </IconButton>
            </Box>
            <Menu anchorEl={menuEl} open={!!menuEl} onClose={() => setMenuEl(null)}>
                <MenuItem onClick={() => { setMenuEl(null); open(); }}><ListItemIcon><OpenIcon fontSize="small" /></ListItemIcon>Open school</MenuItem>
                <MenuItem onClick={() => { setMenuEl(null); setPayOpen(true); }}><ListItemIcon><PayIcon fontSize="small" /></ListItemIcon>Record payment</MenuItem>
                <MenuItem onClick={() => { setMenuEl(null); setEditing((v) => !v); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>{editing ? "Close editor" : "Edit plan and limits"}</MenuItem>
            </Menu>
            <PaymentDialog open={payOpen} school={school} onClose={() => setPayOpen(false)} onSaved={() => onSaved()} />
            {editing && (
                <Box sx={{ p: { xs: 1.5, sm: 2.5 }, borderTop: "1px solid var(--sl-border)" }}>
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
    const [sort, setSort] = useState("name");
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
            <Box sx={{ maxWidth: 900 }}>
                <Skeleton variant="rounded" height={60} sx={{ mb: 2 }} />
                {[0, 1, 2, 3].map((i) => <Skeleton key={i} variant="rounded" height={74} sx={{ mb: 1.25 }} />)}
            </Box>
        );
    }
    return (
        <Box sx={{ maxWidth: 900 }}>
            <PageHeader
                eyebrow="Platform Console"
                title="Schools"
                subtitle="Every school on the platform. Tap a school to open it."
                avatar={<DomainIcon />}
            />
            {schools.length === 0 && (
                <Box sx={{ textAlign: "center", py: 5, color: "text.secondary" }}>
                    <DomainIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                    <Typography sx={{ fontWeight: 700 }}>No schools onboarded yet</Typography>
                    <Typography sx={{ fontSize: "0.85rem" }}>Use Onboard School to add the first one.</Typography>
                </Box>
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
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                <Typography sx={{ fontSize: "0.78rem", color: "#64748B" }}>Sort:</Typography>
                {[["name", "Name"], ["expiry", "Expiry soonest"], ["students", "Most students"]].map(([k, l]) => (
                    <Box key={k} role="button" tabIndex={0} onClick={() => setSort(k)}
                        sx={{ px: 1.25, py: 0.35, borderRadius: 99, cursor: "pointer", fontSize: "0.76rem", fontWeight: 700, color: "var(--sl-ink)", border: "1px solid var(--sl-border)", bgcolor: sort === k ? "var(--sl-soft)" : "transparent" }}>
                        {l}
                    </Box>
                ))}
            </Box>
            {[...schools]
                .sort((a, b) => sort === "students" ? (b.students || 0) - (a.students || 0)
                    : sort === "expiry" ? (a.subscription_expiry ? new Date(a.subscription_expiry).getTime() : Infinity) - (b.subscription_expiry ? new Date(b.subscription_expiry).getTime() : Infinity)
                    : String(a.school_name).localeCompare(String(b.school_name)))
                .filter((x) => statusFilter === "ALL" || x.status === statusFilter)
                .filter((x) => !search.trim() || `${x.school_name} ${x.school_code} ${x.city || ""}`.toLowerCase().includes(search.trim().toLowerCase()))
                .map((school) => (
                    <SchoolCard key={school.id} school={school} onSaved={handleSaved} />
                ))}
        </Box>
    );
}
export default SchoolsManagementPage;
