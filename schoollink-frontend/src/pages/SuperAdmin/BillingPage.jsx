import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Alert, Box, Button, Card, CircularProgress, MenuItem, Tab, Tabs, TextField, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";

import PaymentsIcon from "@mui/icons-material/PaymentsOutlined";
import DownloadIcon from "@mui/icons-material/FileDownloadOutlined";

import KpiCard from "../../components/Dashboard/KpiCard";
import HistoryList from "../../components/SuperAdmin/HistoryList";
import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import { getPlatformOverview, getPlatformPayments, getPlatformSchools, getSubscriptionHistory } from "../../services/platformAdminService";
import { fmtDate, money } from "../../utils/platformUi";

function toCsv(rows) {

    const head = ["Paid on", "School", "Amount", "Currency", "Method", "Reference", "Plan", "Valid from", "Valid until", "Notes"];

    const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;

    return [head, ...rows.map((p) => [p.paid_on, p.school_name, p.amount, p.currency, p.method, p.reference, p.plan, p.period_start, p.period_end, p.notes])]
        .map((r) => r.map(esc).join(","))
        .join("\n");

}

export default function BillingPage() {

    const navigate = useNavigate();

    const [rows, setRows] = useState(null);
    const [schools, setSchools] = useState([]);
    const [revenue, setRevenue] = useState(null);
    const [schoolId, setSchoolId] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const [error, setError] = useState("");
    const [tab, setTab] = useState("payments");
    const [history, setHistory] = useState(null);

    useEffect(() => {

        Promise.all([getPlatformSchools(), getPlatformOverview()])
            .then(([s, o]) => { setSchools(s.data); setRevenue(o.data.revenue); })
            .catch(() => {});

    }, []);

    useEffect(() => {

        setRows(null);

        getPlatformPayments({ school_id: schoolId || undefined, from: from || undefined, to: to || undefined })
            .then((res) => setRows(res.data))
            .catch((err) => setError(err.response?.data?.message || "Unable to load payments."));

    }, [schoolId, from, to]);

    useEffect(() => {

        setHistory(null);

        getSubscriptionHistory({ school_id: schoolId || undefined, from: from || undefined, to: to || undefined })
            .then((res) => setHistory(res.data))
            .catch(() => setHistory([]));

    }, [schoolId, from, to]);

    function exportCsv() {

        const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });

        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");

        a.href = url;
        a.download = `schoollink-payments-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();

        URL.revokeObjectURL(url);

    }

    const total = (rows || []).reduce((a, p) => a + p.amount, 0);

    return (

        <Box sx={{ maxWidth: 1000 }}>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <Box sx={{ width: 40, height: 40, borderRadius: "10px", bgcolor: "#EDE9FE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <PaymentsIcon sx={{ color: "#7C3AED" }} />
                </Box>
                <Box>
                    <Typography sx={{ color: "#7C3AED", fontWeight: 700, fontSize: "0.75rem", letterSpacing: 0.5, textTransform: "uppercase" }}>
                        Platform Console
                    </Typography>
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>Billing</Typography>
                </Box>
            </Box>

            {revenue && (
                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 6, md: 3 }}><KpiCard title="This month" value={money(revenue.this_month)} icon={<PaymentsIcon sx={{ color: "#16A34A" }} />} iconBg="#DCFCE7" /></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><KpiCard title="Last 12 months" value={money(revenue.last_12_months)} icon={<PaymentsIcon sx={{ color: "#2563EB" }} />} iconBg="#DBEAFE" /></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><KpiCard title="All time" value={money(revenue.all_time)} icon={<PaymentsIcon sx={{ color: "#7C3AED" }} />} iconBg="#EDE9FE" /></Grid>
                    <Grid size={{ xs: 6, md: 3 }}><KpiCard title="Payments recorded" value={revenue.payments} icon={<PaymentsIcon sx={{ color: "#F59E0B" }} />} iconBg="#FEF3C7" /></Grid>
                </Grid>
            )}

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1.5, borderBottom: "1px solid #E2E8F0" }}>
                <Tab value="payments" label="Payments" sx={{ textTransform: "none", fontWeight: 600 }} />
                <Tab value="history" label="Subscription changes" sx={{ textTransform: "none", fontWeight: 600 }} />
            </Tabs>

            <Card sx={{ p: { xs: 2, sm: 2.5 } }}>

                <Grid container spacing={1.5} sx={{ mb: 2 }}>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField select label="School" value={schoolId} fullWidth size="small" onChange={(e) => setSchoolId(e.target.value)}>
                            <MenuItem value="">All schools</MenuItem>
                            {schools.map((s) => <MenuItem key={s.id} value={s.id}>{s.school_name}</MenuItem>)}
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}><SchoolDatePicker label="From" value={from} onChange={setFrom} fullWidth size="small" /></Grid>
                    <Grid size={{ xs: 6, sm: 3 }}><SchoolDatePicker label="To" value={to} onChange={setTo} fullWidth size="small" /></Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <Button fullWidth variant="outlined" startIcon={<DownloadIcon />} disabled={tab !== "payments" || !rows || rows.length === 0} onClick={exportCsv} sx={{ height: 40 }}>
                            CSV
                        </Button>
                    </Grid>
                </Grid>

                {tab === "history" && (
                    <>
                        {!history && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}
                        {history && <HistoryList rows={history} showSchool onOpenSchool={(id) => navigate(`/super-admin/schools/${id}`)} />}
                    </>
                )}

                {tab === "payments" && error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                {tab === "payments" && !rows && !error && <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}><CircularProgress /></Box>}

                {tab === "payments" && rows && (
                    <>
                        <Typography sx={{ color: "#64748B", fontSize: "0.85rem", mb: 1 }}>
                            {rows.length} payment{rows.length === 1 ? "" : "s"} - total {money(total, rows[0]?.currency)}
                        </Typography>

                        {rows.length === 0 && <Typography sx={{ color: "#94A3B8", py: 3 }}>No payments match. Record payments from a school's detail page.</Typography>}

                        {rows.map((p) => (
                            <Box key={p.id} onClick={() => navigate(`/super-admin/schools/${p.school_id}`)}
                                sx={{ display: "flex", justifyContent: "space-between", gap: 1, py: 1.25, borderBottom: "1px solid #F1F5F9", cursor: "pointer", "&:hover": { bgcolor: "#F8FAFC" } }}>
                                <Box sx={{ minWidth: 0 }}>
                                    <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>{p.school_name}</Typography>
                                    <Typography sx={{ color: "#64748B", fontSize: "0.76rem" }}>
                                        {fmtDate(p.paid_on)} - {p.method || "payment"}{p.reference ? ` - ref ${p.reference}` : ""}
                                        {p.period_end ? ` - valid until ${fmtDate(p.period_end)}` : ""}
                                    </Typography>
                                </Box>
                                <Typography sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>{money(p.amount, p.currency)}</Typography>
                            </Box>
                        ))}
                    </>
                )}

            </Card>

        </Box>

    );

}
