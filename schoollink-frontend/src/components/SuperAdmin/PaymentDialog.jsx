import { useEffect, useState } from "react";

import {
    Alert,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    MenuItem,
    TextField
} from "@mui/material";
import Grid from "@mui/material/Grid";

import SchoolDatePicker from "../common/SchoolDatePicker";
import { addSchoolPayment } from "../../services/platformAdminService";

const methods = ["Cash", "UPI", "Bank Transfer", "Cheque", "Card", "Other"];
const plans = ["STANDARD", "PREMIUM", "TRIAL"];

function today() {
    return new Date().toISOString().slice(0, 10);
}

export default function PaymentDialog({ open, school, onClose, onSaved }) {

    const empty = {
        amount: "",
        currency: "INR",
        paid_on: today(),
        period_start: "",
        period_end: "",
        method: "UPI",
        reference: "",
        plan: "",
        notes: "",
        update_expiry: true,
        reactivate: true
    };

    const [form, setForm] = useState(empty);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (open) {
            setForm({ ...empty, plan: school?.subscription_plan || "STANDARD", period_start: school?.subscription_expiry || today() });
            setError("");
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    function set(key, value) {
        setForm((f) => ({ ...f, [key]: value }));
    }

    async function save() {

        setError("");

        if (!form.amount || Number(form.amount) < 0) {
            setError("Enter the amount received.");
            return;
        }

        if (form.update_expiry && !form.period_end) {
            setError("Choose the 'Valid until' date, or untick the expiry option.");
            return;
        }

        try {
            setSaving(true);
            await addSchoolPayment(school.id, form);
            onSaved?.();
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || "Unable to record the payment.");
        } finally {
            setSaving(false);
        }

    }

    return (

        <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>

            <DialogTitle>Record payment{school ? ` - ${school.school_name}` : ""}</DialogTitle>

            <DialogContent>

                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={2} sx={{ mt: 0.5 }}>

                    <Grid size={{ xs: 8, sm: 5 }}>
                        <TextField label="Amount" type="number" value={form.amount} fullWidth size="small"
                            onChange={(e) => set("amount", e.target.value)} />
                    </Grid>

                    <Grid size={{ xs: 4, sm: 3 }}>
                        <TextField label="Currency" value={form.currency} fullWidth size="small"
                            onChange={(e) => set("currency", e.target.value.toUpperCase().slice(0, 3))} />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4 }}>
                        <SchoolDatePicker label="Paid on" value={form.paid_on} onChange={(v) => set("paid_on", v)} fullWidth size="small" />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <SchoolDatePicker label="Period from" value={form.period_start} onChange={(v) => set("period_start", v)} fullWidth size="small" />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                        <SchoolDatePicker label="Valid until" value={form.period_end} onChange={(v) => set("period_end", v)} fullWidth size="small" />
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                        <TextField select label="Method" value={form.method} fullWidth size="small"
                            onChange={(e) => set("method", e.target.value)}>
                            {methods.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 6 }}>
                        <TextField select label="Plan" value={form.plan} fullWidth size="small"
                            onChange={(e) => set("plan", e.target.value)}>
                            {plans.map((m) => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                        </TextField>
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField label="Reference / transaction no." value={form.reference} fullWidth size="small"
                            onChange={(e) => set("reference", e.target.value)} />
                    </Grid>

                    <Grid size={{ xs: 12 }}>
                        <TextField label="Notes" value={form.notes} fullWidth size="small" multiline minRows={2}
                            onChange={(e) => set("notes", e.target.value)} />
                    </Grid>

                </Grid>

                <FormControlLabel sx={{ mt: 1.5, display: "flex" }}
                    control={<Checkbox checked={form.update_expiry} onChange={(e) => set("update_expiry", e.target.checked)} />}
                    label="Set the subscription expiry to the 'Valid until' date and apply this plan" />

                <FormControlLabel sx={{ display: "flex" }}
                    control={<Checkbox checked={form.reactivate} disabled={!form.update_expiry}
                        onChange={(e) => set("reactivate", e.target.checked)} />}
                    label="Also set the school status to ACTIVE (lifts a suspension)" />

            </DialogContent>

            <DialogActions>
                <Button onClick={onClose} disabled={saving}>Cancel</Button>
                <Button variant="contained" onClick={save} loading={saving} loadingPosition="start">
                    Save payment
                </Button>
            </DialogActions>

        </Dialog>

    );

}
