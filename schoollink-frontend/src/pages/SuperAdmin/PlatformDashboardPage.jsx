import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Card, Chip, Skeleton, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import DomainIcon from "@mui/icons-material/DomainOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import PeopleIcon from "@mui/icons-material/PeopleAltOutlined";
import FamilyIcon from "@mui/icons-material/FamilyRestroomOutlined";
import CheckIcon from "@mui/icons-material/CheckCircleOutlined";
import HourglassIcon from "@mui/icons-material/HourglassTopOutlined";
import BlockIcon from "@mui/icons-material/BlockOutlined";
import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import KpiCard from "../../components/Dashboard/KpiCard";
import MiniBars from "../../components/SuperAdmin/MiniBars";
import PageHeader from "../../components/common/PageHeader";
import PaymentDialog from "../../components/SuperAdmin/PaymentDialog";
import { getPlatformAiUsage, getPlatformOverview } from "../../services/platformAdminService";
import { bytesLabel, fmtDate, money, statusColor, timeAgo, usd } from "../../utils/platformUi";
function SectionCard({ title, subtitle, children, sx }) {
    return (
        <Card sx={{ border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)", borderRadius: 3, p: { xs: 2, sm: 2.5 }, height: "100%", ...sx }}>
            <Typography sx={{ fontWeight: 700 }}>{title}</Typography>
            {subtitle && <Typography sx={{ color: "#64748B", fontSize: "0.8rem", mb: 1 }}>{subtitle}</Typography>}
            {children}
        </Card>
    );
}
function AttentionRow({ school, detail, tone = "default", onOpen, onPay }) {
    return (
        <Box
            sx={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 1, flexWrap: "wrap",
                py: 1, borderBottom: "1px solid var(--sl-border)", "&:last-child": { borderBottom: 0 }
            }}
        >
            <Box sx={{ minWidth: 0, flex: "1 1 180px" }}>
                <Typography sx={{ fontWeight: 700, fontSize: "0.9rem" }} noWrap>{school.school_name}</Typography>
                <Typography sx={{ color: "#64748B", fontSize: "0.76rem" }}>{detail}</Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Chip size="small" color={tone} variant="outlined" label={school.status} />
                {onPay && <Button size="small" variant="contained" onClick={onPay} sx={{ whiteSpace: "nowrap" }}>Record payment</Button>}
                <Button size="small" variant="outlined" onClick={onOpen} sx={{ whiteSpace: "nowrap" }}>Open</Button>
            </Box>
        </Box>
    );
}
function AiUsagePanel({ ai, onOpen }) {
    if (!ai) return <Skeleton variant="rounded" height={90} sx={{ mt: 1 }} />;
    if (ai.schools.length === 0) {
        return <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem", mt: 1 }}>No schools yet.</Typography>;
    }
    return (
        <Box sx={{ mt: 1 }}>
            {ai.schools.map((s) => {
                const pct = Math.min(100, s.percent);
                const color = !s.enabled ? "#CBD5E1" : s.percent >= 100 ? "#EF4444" : s.percent >= 80 ? "#F59E0B" : "var(--sl-accent)";
                return (
                    <Box key={s.id} onClick={() => onOpen(s.id)} sx={{ py: 0.9, cursor: "pointer" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.86rem" }} noWrap>{s.school_name}</Typography>
                            <Typography sx={{ fontSize: "0.8rem", color: "#64748B", whiteSpace: "nowrap" }}>
                                {s.enabled ? `${s.used} / ${s.limit}` : "AI off"}
                            </Typography>
                        </Box>
                        <Box sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", overflow: "hidden", border: "1px solid var(--sl-border)" }}>
                            <Box sx={{ height: "100%", width: `${s.enabled ? Math.max(pct, s.used ? 3 : 0) : 0}%`, bgcolor: color }} />
                        </Box>
                    </Box>
                );
            })}
        </Box>
    );
}
function DashboardSkeleton() {
    return (
        <Box sx={{ maxWidth: 1100 }}>
            <Skeleton variant="rounded" height={60} sx={{ mb: 2.5 }} />
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
                {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <Grid key={i} size={{ xs: 6, md: 3 }}><Skeleton variant="rounded" height={68} /></Grid>
                ))}
            </Grid>
            <Skeleton variant="rounded" height={180} />
        </Box>
    );
}
function Distribution({ data, colors }) {
    const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;
    return (
        <Box sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", height: 10, borderRadius: 5, overflow: "hidden", bgcolor: "#F1F5F9", mb: 1.5 }}>
                {Object.entries(data).map(([k, v]) => (
                    <Box key={k} sx={{ width: `${(v / total) * 100}%`, bgcolor: colors[k] || "#94A3B8" }} />
                ))}
            </Box>
            {Object.entries(data).map(([k, v]) => (
                <Box key={k} sx={{ display: "flex", justifyContent: "space-between", py: 0.4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: colors[k] || "#94A3B8" }} />
                        <Typography sx={{ fontSize: "0.85rem" }}>{k}</Typography>
                    </Box>
                    <Typography sx={{ fontSize: "0.85rem", fontWeight: 600 }}>{v}</Typography>
                </Box>
            ))}
        </Box>
    );
}
const statusColors = { ACTIVE: "#16A34A", TRIAL: "#0EA5E9", SUSPENDED: "#EF4444", EXPIRED: "#F59E0B" };
const planColors = { PREMIUM: "#3B5BDB", STANDARD: "var(--sl-primary-light)", TRIAL: "#0EA5E9" };
export default function PlatformDashboardPage() {
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [ai, setAi] = useState(null);
    const [payFor, setPayFor] = useState(null);
    const loadAll = () => {
        getPlatformOverview()
            .then((res) => setData(res.data))
            .catch((err) => setError(err.response?.data?.message || "Unable to load the dashboard."));
        getPlatformAiUsage().then((res) => setAi(res.data)).catch(() => setAi({ total_used: 0, near_limit: 0, schools: [] }));
    };
    useEffect(() => { loadAll(); }, []);
    if (error) return <Alert severity="error">{error}</Alert>;
    if (!data) return <DashboardSkeleton />;
    const { totals, by_status, by_plan, attention, growth, revenue, recent_activity, storage } = data;
    let firstName = "";
    try { firstName = (JSON.parse(localStorage.getItem("user") || "{}").full_name || "").split(" ")[0]; } catch { firstName = ""; }
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
    const newThisMonth = growth.length ? growth[growth.length - 1].schools : 0;
    const open = (id) => navigate(`/super-admin/schools/${id}`);
    const attentionCount =
        attention.expired_by_date.length + attention.expiring_soon.length +
        attention.near_limit.length + attention.inactive.length;
    return (
        <Box sx={{ maxWidth: 1100 }}>
            <PageHeader
                eyebrow="Platform Console"
                title={`${greeting}${firstName ? `, ${firstName}` : ""}`}
                subtitle={attentionCount ? `${attentionCount} item${attentionCount === 1 ? "" : "s"} need your attention today` : "Everything looks healthy today"}
                avatar={(firstName || "S").charAt(0).toUpperCase()}
            />
            <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
                <Grid size={{ xs: 6, md: 3 }}><KpiCard title="Schools" value={totals.schools} note={newThisMonth ? `+${newThisMonth} this month` : null} icon={<DomainIcon sx={{ color: "#3B5BDB" }} />} iconBg="var(--sl-soft)" /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><KpiCard title="Students" value={totals.students} icon={<SchoolIcon sx={{ color: "var(--sl-primary-light)" }} />} iconBg="var(--sl-soft)" /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><KpiCard title="Teachers" value={totals.teachers} icon={<PeopleIcon sx={{ color: "#0D9488" }} />} iconBg="#CCFBF1" /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><KpiCard title="Parents" value={totals.parents} icon={<FamilyIcon sx={{ color: "#DB2777" }} />} iconBg="#FCE7F3" /></Grid>
            </Grid>
            <Grid container spacing={1.5} sx={{ mb: 3 }}>
                <Grid size={{ xs: 6, md: 3 }}><KpiCard title="Active schools" value={by_status.ACTIVE || 0} icon={<CheckIcon sx={{ color: "#16A34A" }} />} iconBg="#DCFCE7" /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><KpiCard title="On trial" value={by_status.TRIAL || 0} icon={<HourglassIcon sx={{ color: "#0EA5E9" }} />} iconBg="#E0F2FE" /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><KpiCard title="Suspended / expired" value={(by_status.SUSPENDED || 0) + (by_status.EXPIRED || 0)} icon={<BlockIcon sx={{ color: "#EF4444" }} />} iconBg="#FEE2E2" /></Grid>
                <Grid size={{ xs: 6, md: 3 }}><KpiCard title="Revenue this month" value={money(revenue.this_month)} note={revenue.this_month ? "Payments recorded" : null} icon={<PaymentsIcon sx={{ color: "#F59E0B" }} />} iconBg="#FEF3C7" /></Grid>
            </Grid>
            <SectionCard
                title={`Needs attention${attentionCount ? ` (${attentionCount})` : ""}`}
                subtitle="Subscriptions, capacity and activity that may need your action"
                sx={{ mb: 3, height: "auto" }}
            >
                {attentionCount === 0 && (
                    <Alert severity="success" sx={{ mt: 1 }}>Everything looks healthy. No school needs attention.</Alert>
                )}
                <Grid container spacing={3}>
                    {attention.expired_by_date.length > 0 && (
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#B45309", mt: 1 }}>
                                SUBSCRIPTION PAST EXPIRY (still active)
                            </Typography>
                            {attention.expired_by_date.map((s) => (
                                <AttentionRow key={s.id} school={s} tone="warning" onOpen={() => open(s.id)} onPay={() => setPayFor(s)}
                                    detail={`Expired ${fmtDate(s.subscription_expiry)} - ${s.days_overdue} day${s.days_overdue === 1 ? "" : "s"} ago`} />
                            ))}
                        </Grid>
                    )}
                    {attention.expiring_soon.length > 0 && (
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#0369A1", mt: 1 }}>
                                EXPIRING IN 30 DAYS
                            </Typography>
                            {attention.expiring_soon.map((s) => (
                                <AttentionRow key={s.id} school={s} tone={statusColor(s.status)} onOpen={() => open(s.id)} onPay={() => setPayFor(s)}
                                    detail={`Expires ${fmtDate(s.subscription_expiry)} - ${s.days_left} day${s.days_left === 1 ? "" : "s"} left`} />
                            ))}
                        </Grid>
                    )}
                    {attention.near_limit.length > 0 && (
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#B91C1C", mt: 1 }}>
                                NEAR OR OVER CAPACITY LIMIT
                            </Typography>
                            {attention.near_limit.map((s, i) => (
                                <AttentionRow key={`${s.id}-${i}`} school={s} tone="error" onOpen={() => open(s.id)}
                                    detail={`${s.resource}: ${s.used} of ${s.limit} (${s.percent}%)`} />
                            ))}
                        </Grid>
                    )}
                    {attention.inactive.length > 0 && (
                        <Grid size={{ xs: 12, md: 6 }}>
                            <Typography sx={{ fontSize: "0.78rem", fontWeight: 700, color: "#475569", mt: 1 }}>
                                NO LOGIN IN 30 DAYS
                            </Typography>
                            {attention.inactive.map((s) => (
                                <AttentionRow key={s.id} school={s} tone={statusColor(s.status)} onOpen={() => open(s.id)}
                                    detail={`Last login: ${timeAgo(s.last_login)}`} />
                            ))}
                        </Grid>
                    )}
                </Grid>
            </SectionCard>
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12 }}>
                    <SectionCard
                        title="AI usage this month"
                        subtitle={ai ? `${ai.total_used} uses in total${ai.near_limit ? ` - ${ai.near_limit} school${ai.near_limit === 1 ? "" : "s"} near the limit` : ""}` : "Loading"}
                    >
                        <AiUsagePanel ai={ai} onOpen={open} />
                    </SectionCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard title="New schools" subtitle="Onboarded per month (last 12 months)">
                        <MiniBars data={growth.map((g) => ({ month: g.month, value: g.schools }))} />
                    </SectionCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard title="Revenue" subtitle={`Last 12 months: ${money(revenue.last_12_months)}  |  All time: ${money(revenue.all_time)}`}>
                        <MiniBars color="#16A34A" data={revenue.series.map((g) => ({ month: g.month, value: g.amount }))}
                            format={(v) => (v >= 1000 ? `${Math.round(v / 100) / 10}k` : v)} />
                    </SectionCard>
                </Grid>
                <Grid size={{ xs: 12 }}>
                    <SectionCard
                        title="Storage by school"
                        subtitle={`Total ${bytesLabel(totals.storage_bytes)} (about ${usd(totals.storage_cost_usd)} per month on S3)  |  Uploaded in last 30 days: ${storage.uploads_30d.files} files, ${bytesLabel(storage.uploads_30d.bytes)}`}
                    >
                        {storage.top.length === 0 && (
                            <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem", mt: 1 }}>
                                No file usage recorded yet. New uploads are counted automatically; run the backfill to include older files.
                            </Typography>
                        )}
                        {storage.top.map((s) => (
                            <Box key={s.id} onClick={() => open(s.id)} sx={{ py: 1, cursor: "pointer", "&:hover": { bgcolor: "#F8FAFC" }, mx: -1, px: 1, borderRadius: 2 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, mb: 0.5 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.88rem" }} noWrap>{s.school_name}</Typography>
                                    <Typography sx={{ fontSize: "0.82rem", color: "#64748B", whiteSpace: "nowrap" }}>
                                        {bytesLabel(s.storage_bytes)} - {s.files} files{s.percent_of_limit !== null ? ` - ${s.percent_of_limit}% of limit` : ""}
                                    </Typography>
                                </Box>
                                <Box sx={{ height: 8, borderRadius: 4, bgcolor: "#F1F5F9", overflow: "hidden" }}>
                                    <Box sx={{ height: "100%", width: `${Math.max(2, s.share)}%`, bgcolor: s.percent_of_limit >= 90 ? "#EF4444" : "#3B5BDB" }} />
                                </Box>
                            </Box>
                        ))}
                    </SectionCard>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SectionCard title="By status"><Distribution data={by_status} colors={statusColors} /></SectionCard>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                    <SectionCard title="By plan"><Distribution data={by_plan} colors={planColors} /></SectionCard>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                    <SectionCard title="Recent platform activity" subtitle="Changes made by Super Admins">
                        {recent_activity.length === 0 && (
                            <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem", mt: 1 }}>Nothing yet.</Typography>
                        )}
                        {recent_activity.map((a) => (
                            <Box key={a.id} sx={{ py: 0.75, borderBottom: "1px solid #F1F5F9" }}>
                                <Typography sx={{ fontSize: "0.84rem" }}>{a.summary}</Typography>
                                <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8" }}>
                                    {a.actor_name} - {timeAgo(a.created_at)}
                                </Typography>
                            </Box>
                        ))}
                    </SectionCard>
                </Grid>
            </Grid>
            <PaymentDialog open={!!payFor} school={payFor} onClose={() => setPayFor(null)} onSaved={loadAll} />
        </Box>
    );
}
