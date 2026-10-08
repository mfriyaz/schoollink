import { Box, LinearProgress, Typography } from "@mui/material";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import PanelCard, { EmptyState } from "./PanelCard";

const barColors = ["#2563EB", "#16A34A", "#EA580C", "#7C3AED", "#DB2777"];

function PendingAcknowledgementsChart({ pendingByClass }) {
    const data = pendingByClass || [];
    const total = data.reduce((sum, row) => sum + row.pending_count, 0);
    const max = Math.max(...data.map((row) => row.pending_count), 1);

    return (
        <PanelCard
            title="Pending Acknowledgements"
            subtitle="Parents yet to acknowledge, by class"
        >
            {total === 0 ? (
                <EmptyState icon={<TaskAltIcon />} text="All caught up. Nothing pending." />
            ) : (
                <>
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 2 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: "2rem", lineHeight: 1 }}>
                            {total}
                        </Typography>
                        <Typography sx={{ color: "#64748B", fontSize: "0.8rem" }}>
                            pending in total
                        </Typography>
                    </Box>

                    {data.map((row, index) => {
                        const color = barColors[index % barColors.length];

                        return (
                            <Box key={row.class_name} sx={{ mb: 1.5 }}>
                                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                                    <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                                        {row.class_name}
                                    </Typography>
                                    <Typography sx={{ fontSize: "0.82rem", color: "#64748B" }}>
                                        {row.pending_count}
                                    </Typography>
                                </Box>
                                <LinearProgress
                                    variant="determinate"
                                    value={(row.pending_count / max) * 100}
                                    sx={{
                                        height: 8,
                                        borderRadius: 4,
                                        bgcolor: "#F1F5F9",
                                        "& .MuiLinearProgress-bar": {
                                            borderRadius: 4,
                                            bgcolor: color
                                        }
                                    }}
                                />
                            </Box>
                        );
                    })}
                </>
            )}
        </PanelCard>
    );
}

export default PendingAcknowledgementsChart;
