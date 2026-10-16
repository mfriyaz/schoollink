import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert, Box, Button, Card, Chip, CircularProgress, Dialog, DialogActions,
    DialogContent, DialogTitle, IconButton, LinearProgress, Tab, Tabs, TextField, Typography
} from "@mui/material";
import Grid from "@mui/material/Grid";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/AddOutlined";
import HistoryList from "../../components/SuperAdmin/HistoryList";
import AiSchoolCard from "../../components/SuperAdmin/AiSchoolCard";
import PaymentDialog from "../../components/SuperAdmin/PaymentDialog";
import SchoolRecords from "../../components/SuperAdmin/SchoolRecords";
import ResetPasswordDialog from "../../components/common/ResetPasswordDialog";
import {
    deleteSchoolPayment, getPlatformSchool, resetSchoolAdminPassword,
    saveSchoolNotes, setSchoolStatus
} from "../../services/platformAdminService";
import { bytesLabel, fmtDate, money, statusColor, timeAgo, usd } from "../../utils/platformUi";
function Section({ title, action, children }) {
    return (
        <Card sx={{ border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)", borderRadius: 3, p: { xs: 2, sm: 2.5 }, mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1, gap: 1, flexWrap: "wrap" }}>
                <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
                {action}
            </Box>
            {children}
        </Card>
    );
}
function Field({ label, value }) {
    return (
        <Box sx={{ mb: 1.25 }}>
            <Typography sx={{ color: "#94A3B8", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 0.4 }}>{label}</Typography>
            <Typography sx={{ fontSize: "0.9rem", overflowWrap: "anywhere" }}>{value || "-"}</Typography>
        </Box>
    );
}
function UsageBar({ label, used, limit }) {
    const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
    const color = !limit ? "primary" : pct >= 100 ? "error" : pct >= 90 ? "warning" : "primary";
    return (
        <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                <Typography sx={{ fontSize: "0.88rem", fontWeight: 600 }}>{label}</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                    {used}{limit ? ` / ${limit}` : " (no limit set)"}
                </Typography>
            </Box>
            <LinearProgress variant="determinate" value={limit ? pct : 0} color={color}
                sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9" }} />
        </Box>
    );
}
export default function SchoolDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [tab, setTab] = useState("overview");
    const [error, setError] = useState("");
    const [payOpen, setPayOpen] = useState(false);
    const [resetAdmin, setResetAdmin] = useState(null);
    const [statusDialog, setStatusDialog] = useState(null);
    const [reason, setReason] = useState("");
    const [statusBusy, setStatusBusy] = useState(false);
    const [notes, setNotes] = useState("");
    const [notesBusy, setNotesBusy] = useState(false);
    const [notesMsg, setNotesMsg] = useState("");
    const load = useCallback(() => {
        getPlatformSchool(id)
            .then((res) => { setData(res.data); setNotes(res.data.school.internal_notes || ""); })
            .catch((err) => setError(err.response?.data?.message || "Unable to load this school."));
    }, [id]);
    useEffect(() => { load(); }, [load]);
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!data) return <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}><CircularProgress /></Box>;
    const { school, admins, payments, activity, actions_30d, storage } = data;
    const suspended = school.status === "SUSPENDED";
    const daysLeft = school.subscription_expiry
        ? Math.round((new Date(`${school.subscription_expiry}T00:00:00`) - new Date(new Date().toDateString())) / 86400000)
        : null;
    async function confirmStatus() {
        try {
            setStatusBusy(true);
            await setSchoolStatus(school.id, statusDialog, reason);
            setStatusDialog(null);
            setReason("");
            load();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to change the status.");
        } finally {
            setStatusBusy(false);
        }
    }
    async function removePayment(paymentId) {
        if (!window.confirm("Delete this payment record? The subscription dates will not change.")) return;
        await deleteSchoolPayment(paymentId);
        load();
    }
    async function saveNotes() {
        try {
            setNotesBusy(true);
            await saveSchoolNotes(school.id, notes);
            setNotesMsg("Saved");
            setTimeout(() => setNotesMsg(""), 2000);
        } finally {
            setNotesBusy(false);
        }
    }
    return (
        <Box sx={{ maxWidth: 1000 }}>
            <Box role="button" tabIndex={0} onClick={() => navigate("/super-admin/schools")} sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.55, mb: 1.5, borderRadius: 99, cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, color: "var(--sl-ink)", border: "1.5px solid var(--sl-ink)", "&:hover": { bgcolor: "var(--sl-soft)" } }}>
                <ArrowBackIcon sx={{ fontSize: 18 }} />
                All schools
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1.5, mb: 2 }}>
                <Box>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>{school.school_name}</Typography>
                    <Typography sx={{ color: "#64748B", fontSize: "0.85rem" }}>
                        {school.school_code}{school.city ? ` - ${school.city}` : ""}{school.country ? `, ${school.country}` : ""}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
                        <Chip size="small" label={school.subscription_plan} />
                        <Chip size="small" color={statusColor(school.status)} label={school.status} />
                    </Box>
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setPayOpen(true)}>Record payment</Button>
                    {suspended ? (
                        <Button color="success" variant="outlined" onClick={() => setStatusDialog("ACTIVE")}>Reactivate</Button>
                    ) : (
                        <Button color="error" variant="outlined" onClick={() => setStatusDialog("SUSPENDED")}>Suspend</Button>
                    )}
                </Box>
            </Box>
            {suspended && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    This school is suspended. None of its users (admin, teachers, parents) can log in or use the app.
                </Alert>
            )}
            {daysLeft !== null && daysLeft < 0 && !suspended && school.status !== "EXPIRED" && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    The subscription expired {-daysLeft} day{-daysLeft === 1 ? "" : "s"} ago, but the school is still active.
                    Record a payment to renew, or suspend the school.
                </Alert>
            )}
            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, minHeight: 0, "& .MuiTabs-indicator": { display: "none" }, "& .MuiTabs-flexContainer": { gap: 1, flexWrap: "wrap" }, "& .MuiTab-root": { textTransform: "none", fontWeight: 700, minHeight: 36, py: 0.5, px: 1.75, borderRadius: 99, color: "var(--sl-ink)", border: "1.5px solid var(--sl-ink)", "&.Mui-selected": { bgcolor: "var(--sl-accent)", color: "var(--sl-ink)" } } }}>
                <Tab value="overview" label="Overview" />
                <Tab value="records" label="School records" />
            </Tabs>
            {tab === "records" ? (
                <SchoolRecords schoolId={school.id} />
            ) : (
                <>
            <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Section title="Subscription">
                        <Field label="Plan" value={school.subscription_plan} />
                        <Field label="Status" value={school.status} />
                        <Field label="Expiry" value={school.subscription_expiry
                            ? `${fmtDate(school.subscription_expiry)} (${daysLeft >= 0 ? `${daysLeft} days left` : `${-daysLeft} days overdue`})`
                            : "No expiry set"} />
                        <Field label="Onboarded" value={fmtDate(school.created_at)} />
                        <Field label="Last login at this school" value={timeAgo(school.last_login)} />
                    </Section>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <Section title="Usage vs limits">
                        <UsageBar label="Students" used={school.students} limit={school.max_students} />
                        <UsageBar label="Teachers" used={school.teachers} limit={school.max_teachers} />
                        <UsageBar label="Classes" used={school.classes} limit={school.max_classes} />
                        <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                            Parents with accounts: <b>{school.parents}</b>
                            {actions_30d !== null && <> &nbsp;|&nbsp; Actions in last 30 days: <b>{actions_30d}</b></>}
                        </Typography>
                        <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mt: 0.5 }}>
                            Change limits from Schools - Manage.
                        </Typography>
                    </Section>
                </Grid>
            </Grid>
            <Section title="AI assistant">
                <AiSchoolCard schoolId={id} />
            </Section>
            <Section title="Storage (photos, voice notes, files)">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Box sx={{ mb: 2 }}>
                            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                <Typography sx={{ fontSize: "0.88rem", fontWeight: 600 }}>Used</Typography>
                                <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                                    {bytesLabel(storage.bytes)}{storage.limit_mb ? ` / ${storage.limit_mb} MB` : " (no limit set)"}
                                </Typography>
                            </Box>
                            <LinearProgress variant="determinate"
                                value={storage.limit_mb ? Math.min(100, (storage.bytes / 1048576 / storage.limit_mb) * 100) : 0}
                                color={storage.limit_mb && storage.bytes / 1048576 >= storage.limit_mb ? "error" : (storage.limit_mb && storage.bytes / 1048576 >= storage.limit_mb * 0.9 ? "warning" : "primary")}
                                sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9" }} />
                        </Box>
                        <Typography sx={{ fontSize: "0.85rem", color: "#64748B" }}>
                            {storage.files} files - last 30 days: {storage.last_30_days.files} files ({bytesLabel(storage.last_30_days.bytes)})
                        </Typography>
                        <Typography sx={{ fontSize: "0.85rem", color: "#64748B", mt: 0.5 }}>
                            Estimated S3 cost: {usd(storage.cost_usd)} per month
                        </Typography>
                        <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mt: 1.5 }}>
                            {storage.by_kind.map((k) => (
                                <Chip key={k.kind} size="small" variant="outlined" label={`${k.kind}: ${k.files} (${bytesLabel(k.bytes)})`} />
                            ))}
                        </Box>
                        {storage.files === 0 && (
                            <Typography sx={{ color: "#94A3B8", fontSize: "0.8rem", mt: 1 }}>
                                Nothing tracked yet. New uploads are counted automatically; older files need the backfill.
                            </Typography>
                        )}
                        <Typography sx={{ fontSize: "0.75rem", color: "#94A3B8", mt: 1 }}>
                            Set a storage limit in Schools - Manage. See every file under School records - Files.
                        </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                        <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", mb: 0.5 }}>LARGEST FILES</Typography>
                        {storage.biggest.length === 0 && <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>-</Typography>}
                        {storage.biggest.map((f) => (
                            <Box key={f.id} sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: 0.75, borderBottom: "1px solid #F1F5F9" }}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontSize: "0.84rem", overflowWrap: "anywhere" }}>{f.filename || "-"}</Typography>
                                    <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                                        {f.kind}{f.uploaded_by ? ` - ${f.uploaded_by}` : ""} - {timeAgo(f.created_at)}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontSize: "0.84rem", fontWeight: 600, whiteSpace: "nowrap" }}>{bytesLabel(f.bytes)}</Typography>
                            </Box>
                        ))}
                    </Grid>
                </Grid>
            </Section>
            <Section title="Subscription history (who changed what)">
                <HistoryList rows={data.history || []} />
            </Section>
            <Section title="Contact">
                <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 4 }}><Field label="School email" value={school.email} /></Grid>
                    <Grid size={{ xs: 12, sm: 4 }}><Field label="Phone" value={school.phone} /></Grid>
                    <Grid size={{ xs: 12, sm: 4 }}><Field label="Time zone" value={school.timezone} /></Grid>
                </Grid>
            </Section>
            <Section title="School administrators">
                {admins.length === 0 && <Typography sx={{ color: "#94A3B8" }}>No administrator account found.</Typography>}
                {admins.map((a) => (
                    <Box key={a.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, py: 1, borderBottom: "1px solid #F1F5F9", flexWrap: "wrap" }}>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{a.full_name}</Typography>
                            <Typography sx={{ color: "#64748B", fontSize: "0.78rem", overflowWrap: "anywhere" }}>
                                {a.email}{a.username ? ` - @${a.username}` : ""} - last login {timeAgo(a.last_login)}
                            </Typography>
                        </Box>
                        <Button size="small" color="warning" onClick={() => setResetAdmin(a)}>Reset password</Button>
                    </Box>
                ))}
            </Section>
            <Section title="Payments" action={<Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
                Total: {money(payments.reduce((a, p) => a + p.amount, 0), payments[0]?.currency)}
            </Typography>}>
                {payments.length === 0 && <Typography sx={{ color: "#94A3B8", fontSize: "0.88rem" }}>No payments recorded yet.</Typography>}
                {payments.map((p) => (
                    <Box key={p.id} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, py: 1, borderBottom: "1px solid #F1F5F9" }}>
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                                {money(p.amount, p.currency)} <span style={{ color: "#64748B", fontWeight: 400 }}>- {p.method || "payment"}</span>
                            </Typography>
                            <Typography sx={{ color: "#64748B", fontSize: "0.76rem" }}>
                                Paid {fmtDate(p.paid_on)}
                                {p.period_end ? ` - valid until ${fmtDate(p.period_end)}` : ""}
                                {p.reference ? ` - ref ${p.reference}` : ""}
                            </Typography>
                            {p.notes && <Typography sx={{ color: "#94A3B8", fontSize: "0.74rem" }}>{p.notes}</Typography>}
                        </Box>
                        <IconButton size="small" onClick={() => removePayment(p.id)} aria-label="Delete payment">
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ))}
            </Section>
            <Section title="Internal notes" action={notesMsg && <Typography sx={{ color: "#16A34A", fontSize: "0.8rem" }}>{notesMsg}</Typography>}>
                <Typography sx={{ color: "#94A3B8", fontSize: "0.75rem", mb: 1 }}>Only visible to Super Admins.</Typography>
                <TextField multiline minRows={3} fullWidth value={notes} onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Principal prefers WhatsApp. Renewal discussed for April." />
                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1 }}>
                    <Button variant="contained" onClick={saveNotes} loading={notesBusy} loadingPosition="start">Save notes</Button>
                </Box>
            </Section>
            <Section title="Activity on this school">
                {activity.length === 0 && <Typography sx={{ color: "#94A3B8", fontSize: "0.88rem" }}>No platform changes recorded yet.</Typography>}
                {activity.map((a) => (
                    <Box key={a.id} sx={{ py: 0.75, borderBottom: "1px solid #F1F5F9" }}>
                        <Typography sx={{ fontSize: "0.84rem" }}>{a.summary}</Typography>
                        <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>{a.actor_name} - {timeAgo(a.created_at)}</Typography>
                    </Box>
                ))}
            </Section>
                </>
            )}
            <PaymentDialog open={payOpen} school={school} onClose={() => setPayOpen(false)} onSaved={load} />
            <ResetPasswordDialog
                open={!!resetAdmin}
                name={resetAdmin?.full_name}
                onReset={() => resetSchoolAdminPassword(resetAdmin.id)}
                onClose={() => setResetAdmin(null)}
            />
            <Dialog open={!!statusDialog} onClose={statusBusy ? undefined : () => setStatusDialog(null)} maxWidth="xs" fullWidth>
                <DialogTitle>{statusDialog === "SUSPENDED" ? "Suspend this school?" : "Reactivate this school?"}</DialogTitle>
                <DialogContent>
                    <Typography sx={{ fontSize: "0.9rem", mb: 2 }}>
                        {statusDialog === "SUSPENDED"
                            ? "All users of this school (admin, teachers, parents) will be locked out immediately until you reactivate it. Their data is kept."
                            : "The school's users will be able to log in again."}
                    </Typography>
                    <TextField label="Reason (optional, saved in the activity log)" value={reason} fullWidth size="small"
                        onChange={(e) => setReason(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialog(null)} disabled={statusBusy}>Cancel</Button>
                    <Button variant="contained" color={statusDialog === "SUSPENDED" ? "error" : "success"}
                        onClick={confirmStatus} loading={statusBusy} loadingPosition="start">
                        {statusDialog === "SUSPENDED" ? "Suspend" : "Reactivate"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
