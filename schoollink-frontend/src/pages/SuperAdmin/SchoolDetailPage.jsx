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

import PaymentDialog from "../../components/SuperAdmin/PaymentDialog";
import SchoolRecords from "../../components/SuperAdmin/SchoolRecords";
import ResetPasswordDialog from "../../components/common/ResetPasswordDialog";
import {
    deleteSchoolPayment, getPlatformSchool, resetSchoolAdminPassword,
    saveSchoolNotes, setSchoolStatus
} from "../../services/platformAdminService";
import { fmtDate, money, statusColor, timeAgo } from "../../utils/platformUi";

function Section({ title, action, children }) {

    return (
        <Card sx={{ p: { xs: 2, sm: 2.5 }, mb: 2 }}>
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

    const { school, admins, payments, activity, actions_30d } = data;

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

            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/super-admin/schools")} sx={{ mb: 1 }}>
                All schools
            </Button>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 1.5, mb: 2 }}>

                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>{school.school_name}</Typography>
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

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, borderBottom: "1px solid #E2E8F0" }}>
                <Tab value="overview" label="Overview" sx={{ textTransform: "none", fontWeight: 600 }} />
                <Tab value="records" label="School records" sx={{ textTransform: "none", fontWeight: 600 }} />
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
