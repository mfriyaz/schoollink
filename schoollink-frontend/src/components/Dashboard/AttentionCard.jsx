import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Box, Skeleton, Typography } from "@mui/material";

import PanelCard, { EmptyState } from "./PanelCard";
import { getAttention } from "../../services/attentionService";

const SEV = {
    high: { label: "Needs attention", fg: "#B91C1C", bg: "#FEE2E2" },
    medium: { label: "Keep an eye", fg: "#B45309", bg: "#FEF3C7" }
};

/** Dashboard: the five students who most need a follow-up today. */
export default function AttentionCard() {

    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        getAttention({ limit: 5 })
            .then((r) => { if (r.success) setData(r.data); else setFailed(true); })
            .catch(() => setFailed(true));
    }, []);

    if (failed) return null;

    return (
        <Box sx={{ mb: 3 }} data-testid="attention-card">
            <PanelCard
                title="Students needing attention"
                subtitle={data ? `${data.open_count} to follow up` : "Checking attendance and marks"}
                action={
                    <Typography
                        onClick={() => navigate("/early-warning")}
                        sx={{ color: "var(--sl-primary, var(--sl-primary))", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", whiteSpace: "nowrap", "&:hover": { textDecoration: "underline" } }}
                    >
                        View all
                    </Typography>
                }
            >
                {!data && <Skeleton variant="rounded" height={90} />}

                {data && data.items.length === 0 && <EmptyState text="No student needs a follow-up right now." />}

                {data && data.items.map((it) => {
                    const sev = SEV[it.severity] || SEV.medium;
                    return (
                        <Box key={it.student_id} data-testid="attention-row" sx={{ display: "flex", alignItems: "center", gap: 1.25, py: 1, borderTop: "1px solid var(--sl-border)", "&:first-of-type": { borderTop: 0 } }}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Typography component={RouterLink} to={`/students/${it.student_id}`} sx={{ fontWeight: 700, color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}>
                                    {it.name}
                                </Typography>
                                <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }} noWrap>
                                    {it.class_name} - {it.section_name} · {it.flags[0] ? it.flags[0].text : ""}
                                </Typography>
                            </Box>
                            <Box component="span" sx={{ px: 1.1, py: 0.2, borderRadius: 99, fontSize: "0.72rem", fontWeight: 700, color: sev.fg, bgcolor: sev.bg, whiteSpace: "nowrap" }}>
                                {sev.label}
                            </Box>
                        </Box>
                    );
                })}
            </PanelCard>
        </Box>
    );
}
