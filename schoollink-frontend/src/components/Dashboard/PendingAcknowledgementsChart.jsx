import { Box, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForwardRounded";
import PanelCard, { EmptyState } from "./PanelCard";

// Distinct colours so every class is easy to tell apart (same in every theme)
const COLORS = ["#2D7FF9", "#9B6DD8", "#F5A623", "#34B36B", "#E8559A"];

const OTHERS_COLOR = "#9AA5B8";

const SIZE = 176;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRC = 2 * Math.PI * RADIUS;
const GAP = 3; // px gap between segments

/** Top 4 classes; anything beyond that is grouped as "Others" */
function buildSlices(rows) {

    const sorted = [...rows]
        .filter((r) => r.pending_count > 0)
        .sort((a, b) => b.pending_count - a.pending_count);

    if (sorted.length <= 5) {

        return sorted.map((r, i) => ({ name: r.class_name, value: r.pending_count, color: COLORS[i] }));

    }

    const top = sorted.slice(0, 4).map((r, i) => ({ name: r.class_name, value: r.pending_count, color: COLORS[i] }));

    const others = sorted.slice(4).reduce((s, r) => s + r.pending_count, 0);

    return [...top, { name: "Others", value: others, color: OTHERS_COLOR }];

}

function PendingAcknowledgementsChart({ pendingByClass }) {

    const slices = buildSlices(pendingByClass || []);

    const total = slices.reduce((s, x) => s + x.value, 0);

    let offset = 0;

    return (

        <PanelCard title="Pending Acknowledgements">

            {total === 0 ? (

                <EmptyState icon={<TaskAltIcon />} text="All caught up. Nothing pending." />

            ) : (

                <>

                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexWrap: "wrap",
                            gap: { xs: 2, sm: 3 },
                            py: 1
                        }}
                    >

                        {/* Donut */}
                        <Box sx={{ position: "relative", width: SIZE, height: SIZE, flexShrink: 0 }}>

                            <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} role="img" aria-label={`${total} pending acknowledgements`}>

                                <circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} fill="none" stroke="#EEF1F6" strokeWidth={STROKE} />

                                <g transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}>

                                    {slices.map((s) => {

                                        const len = (s.value / total) * CIRC;

                                        const dash = Math.max(len - (slices.length > 1 ? GAP : 0), 0.5);

                                        const el = (
                                            <circle
                                                key={s.name}
                                                cx={SIZE / 2}
                                                cy={SIZE / 2}
                                                r={RADIUS}
                                                fill="none"
                                                stroke={s.color}
                                                strokeWidth={STROKE}
                                                strokeDasharray={`${dash} ${CIRC - dash}`}
                                                strokeDashoffset={-offset}
                                            >
                                                <title>{`${s.name}: ${s.value} pending`}</title>
                                            </circle>
                                        );

                                        offset += len;

                                        return el;

                                    })}

                                </g>

                            </svg>

                            <Box
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    pointerEvents: "none"
                                }}
                            >
                                <Typography sx={{ fontWeight: 800, fontSize: "2.1rem", lineHeight: 1 }}>{total}</Typography>
                                <Typography sx={{ color: "#64748B", fontSize: "0.8rem", mt: 0.5 }}>Pending</Typography>
                            </Box>

                        </Box>

                        {/* Legend */}
                        <Box sx={{ minWidth: 150, flex: "1 1 150px", maxWidth: 260 }}>

                            {slices.map((s) => (

                                <Box key={s.name} sx={{ display: "flex", alignItems: "center", gap: 1.25, py: 0.85 }}>
                                    <Box sx={{ width: 11, height: 11, borderRadius: "4px", bgcolor: s.color, flexShrink: 0 }} />
                                    <Typography noWrap sx={{ flex: 1, fontSize: "0.9rem", fontWeight: 600, minWidth: 0 }}>{s.name}</Typography>
                                    <Typography sx={{ fontSize: "0.9rem", fontWeight: 700 }}>{s.value}</Typography>
                                </Box>

                            ))}

                        </Box>

                    </Box>

                    <Box sx={{ borderTop: "1px solid #EEF1F6", mt: 1.5, pt: 1.5, textAlign: "center" }}>
                        <Box
                            component={Link}
                            to="/reports"
                            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 700, fontSize: "0.9rem", color: "var(--sl-primary)", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                        >
                            View Report <ArrowForwardIcon sx={{ fontSize: 18 }} />
                        </Box>
                    </Box>

                </>

            )}

        </PanelCard>

    );

}

export default PendingAcknowledgementsChart;
