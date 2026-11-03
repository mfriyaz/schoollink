import { useCallback, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Card, Skeleton, Tab, Tabs, TextField, Typography } from "@mui/material";
import EventBusyIcon from "@mui/icons-material/EventBusyOutlined";

import PageHeader from "../../components/common/PageHeader";
import LeaveStatusPill, { leaveDates } from "../../components/common/LeaveStatusPill";
import { decideLeave, getLeaveRequests } from "../../services/leaveService";

/** School Admin and class teachers: answer parents' leave requests. */
function LeaveRequestsPage() {

    const [tab, setTab] = useState("pending");
    const [rows, setRows] = useState(null);
    const [error, setError] = useState("");
    const [notes, setNotes] = useState({});
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(async (t) => {
        try {
            setError("");
            const res = await getLeaveRequests(t === "all" ? "all" : undefined);
            setRows(res.data);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load leave requests.");
        }
    }, []);

    useEffect(() => { setRows(null); load(tab); }, [tab, load]);

    const decide = async (id, decision) => {
        try {
            setBusyId(id);
            await decideLeave(id, decision, notes[id]);
            await load(tab);
        } catch (err) {
            setError(err.response?.data?.message || "Unable to save the answer.");
        } finally {
            setBusyId(null);
        }
    };

    return (
        <Box sx={{ maxWidth: 900 }}>

            <PageHeader
                eyebrow="Attendance"
                title="Leave requests"
                subtitle="Parents ask for leave in the app. Answer here and they get an alert."
                avatar={<EventBusyIcon sx={{ fontSize: 22 }} />}
            />

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab value="pending" label="Waiting" />
                <Tab value="all" label="All" />
            </Tabs>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!rows && <Skeleton variant="rounded" height={160} />}

            {rows && rows.length === 0 && (
                <Typography sx={{ color: "text.secondary" }}>{tab === "pending" ? "No requests waiting." : "No leave requests yet."}</Typography>
            )}

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {(rows || []).map((r) => (
                    <Card key={r.id} data-testid="leave-row" sx={{ p: 2 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                            <Box sx={{ minWidth: 0 }}>
                                <RouterLink to={`/students/${r.student_id}`} style={{ color: "inherit", fontWeight: 800 }}>{r.first_name} {r.last_name || ""}</RouterLink>
                                <Typography component="span" sx={{ color: "text.secondary", fontSize: "0.85rem", ml: 1 }}>{r.class_name} - {r.section_name}</Typography>
                            </Box>
                            <LeaveStatusPill status={r.status} />
                        </Box>
                        <Typography sx={{ fontWeight: 700, mt: 0.75 }}>{leaveDates(r)}</Typography>
                        <Typography sx={{ fontSize: "0.9rem", mt: 0.25, overflowWrap: "anywhere" }}>{r.reason}</Typography>
                        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary", mt: 0.5 }}>Asked by {r.parent_name}</Typography>

                        {r.status === "Pending" ? (
                            <Box sx={{ mt: 1.5, display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
                                <TextField size="small" placeholder="Note to parent (optional)" value={notes[r.id] || ""}
                                    onChange={(e) => setNotes({ ...notes, [r.id]: e.target.value })}
                                    inputProps={{ maxLength: 300 }} sx={{ flex: 1, minWidth: 200 }} />
                                <Button variant="contained" disabled={busyId === r.id} onClick={() => decide(r.id, "Approved")}>Approve</Button>
                                <Button variant="outlined" color="inherit" disabled={busyId === r.id} onClick={() => decide(r.id, "Declined")}>Decline</Button>
                            </Box>
                        ) : (
                            r.decision_note && <Typography sx={{ fontSize: "0.88rem", mt: 0.75 }}><b>{r.decided_by_name}:</b> {r.decision_note}</Typography>
                        )}
                    </Card>
                ))}
            </Box>
        </Box>
    );
}

export default LeaveRequestsPage;
