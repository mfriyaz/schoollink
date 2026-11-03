import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Button, Card, CircularProgress, TextField, Typography } from "@mui/material";

import ChildHeader from "../../components/Parent/ChildHeader";
import LeaveStatusPill, { leaveDates } from "../../components/common/LeaveStatusPill";
import { getMyChildren } from "../../services/postService";
import { getMyLeave, requestLeave, withdrawLeave } from "../../services/leaveService";

function todayLocal() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Parents ask for leave for a child and see the answer. */
export default function ParentLeavePage() {

    const [children, setChildren] = useState([]);
    const [studentId, setStudentId] = useState("");
    const [loading, setLoading] = useState(true);
    const [list, setList] = useState([]);
    const [from, setFrom] = useState(todayLocal());
    const [to, setTo] = useState(todayLocal());
    const [reason, setReason] = useState("");
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState("");

    const loadList = useCallback(() => {
        getMyLeave().then((r) => { if (r.success) setList(r.data); }).catch(() => { /* shown as empty */ });
    }, []);

    useEffect(() => {
        getMyChildren()
            .then((res) => {
                if (res.success && res.data.length > 0) {
                    setChildren(res.data);
                    setStudentId(res.data[0].student_id);
                }
            })
            .catch(() => { /* shown as empty */ })
            .finally(() => setLoading(false));
        loadList();
    }, [loadList]);

    const child = children.find((c) => c.student_id === studentId);
    const mine = list.filter((r) => r.student_id === studentId);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setDone("");
        try {
            setBusy(true);
            await requestLeave({ student_id: studentId, from_date: from, to_date: to, reason });
            setReason("");
            setDone("Leave request sent. You will get an alert when it is answered.");
            loadList();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to send the request.");
        } finally {
            setBusy(false);
        }
    };

    const withdraw = async (id) => {
        try {
            await withdrawLeave(id);
            loadList();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to withdraw the request.");
        }
    };

    return (
        <Box sx={{ maxWidth: 720 }}>

            <ChildHeader child={child} kids={children} selectedId={studentId} onSelect={(id) => { setStudentId(id); setDone(""); setError(""); }} eyebrow="Leave" />

            {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}

            {!loading && !studentId && <Typography sx={{ color: "text.secondary" }}>No child is linked to your account yet.</Typography>}

            {studentId && (
                <>
                    <Card component="form" onSubmit={submit} sx={{ p: 2.25, mb: 2.5 }}>
                        <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Ask for leave</Typography>
                        <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", mb: 1.5 }}>
                            <TextField type="date" size="small" label="From" value={from} InputLabelProps={{ shrink: true }}
                                onChange={(e) => { setFrom(e.target.value); if (to < e.target.value) setTo(e.target.value); }} required />
                            <TextField type="date" size="small" label="To" value={to} InputLabelProps={{ shrink: true }}
                                inputProps={{ min: from }} onChange={(e) => setTo(e.target.value)} required />
                        </Box>
                        <TextField fullWidth multiline minRows={2} size="small" label="Reason" value={reason}
                            onChange={(e) => setReason(e.target.value)} inputProps={{ maxLength: 500 }} required sx={{ mb: 1.5 }} />
                        {error && <Alert severity="error" sx={{ mb: 1.5 }}>{error}</Alert>}
                        {done && <Alert severity="success" sx={{ mb: 1.5 }}>{done}</Alert>}
                        <Button type="submit" variant="contained" disabled={busy}>{busy ? "Sending..." : "Send request"}</Button>
                    </Card>

                    <Typography sx={{ fontWeight: 800, mb: 1 }}>Past requests</Typography>
                    {mine.length === 0 && <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>No leave requests yet.</Typography>}
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25 }}>
                        {mine.map((r) => (
                            <Card key={r.id} data-testid="my-leave" sx={{ p: 1.75 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                    <Typography sx={{ fontWeight: 700 }}>{leaveDates(r)}</Typography>
                                    <LeaveStatusPill status={r.status} />
                                </Box>
                                <Typography sx={{ fontSize: "0.88rem", color: "text.secondary", mt: 0.5, overflowWrap: "anywhere" }}>{r.reason}</Typography>
                                {r.decision_note && (
                                    <Typography sx={{ fontSize: "0.88rem", mt: 0.75, overflowWrap: "anywhere" }}>
                                        <b>{r.decided_by_name || "School"}:</b> {r.decision_note}
                                    </Typography>
                                )}
                                {r.status === "Pending" && (
                                    <Button size="small" color="inherit" sx={{ mt: 0.75, ml: -1 }} onClick={() => withdraw(r.id)}>Withdraw</Button>
                                )}
                            </Card>
                        ))}
                    </Box>
                </>
            )}
        </Box>
    );
}
