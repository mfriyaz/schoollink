import { Box, Chip, Typography } from "@mui/material";

import { changeLines, timeAgo } from "../../utils/platformUi";

const sourceLabel = { manual: "Edited", payment: "Payment", status: "Status change" };

/** Who changed which subscription field, from what to what, and why */
export default function HistoryList({ rows, showSchool, onOpenSchool }) {

    if (!rows || rows.length === 0) {

        return <Typography sx={{ color: "#94A3B8", fontSize: "0.88rem", py: 2 }}>No changes recorded yet.</Typography>;

    }

    return rows.map((h) => (

        <Box
            key={h.id}
            onClick={showSchool && onOpenSchool ? () => onOpenSchool(h.school_id) : undefined}
            sx={{ py: 1.25, borderBottom: "1px solid #F1F5F9", cursor: showSchool && onOpenSchool ? "pointer" : "default", "&:hover": showSchool ? { bgcolor: "#F8FAFC" } : {} }}
        >

            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>
                    {showSchool ? h.school_name : (sourceLabel[h.source] || "Changed")}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {showSchool && <Chip size="small" variant="outlined" label={sourceLabel[h.source] || "Changed"} />}
                    <Typography sx={{ color: "#94A3B8", fontSize: "0.74rem" }}>{timeAgo(h.created_at)}</Typography>
                </Box>
            </Box>

            {changeLines(h.changes).map((c) => (
                <Typography key={c.field} sx={{ fontSize: "0.84rem" }}>
                    <span style={{ color: "#64748B" }}>{c.label}:</span> {c.from} <b>→</b> <b>{c.to}</b>
                </Typography>
            ))}

            {h.reason && (
                <Typography sx={{ fontSize: "0.78rem", color: "#475569", mt: 0.5 }}>Reason: {h.reason}</Typography>
            )}

            <Typography sx={{ fontSize: "0.72rem", color: "#94A3B8", mt: 0.25 }}>
                by {h.changed_by_name || "Super Admin"}
            </Typography>

        </Box>

    ));

}
