import { useState } from "react";
import { Box, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import PanelCard from "./PanelCard";

const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

function CalendarCard() {
    const today = new Date();
    const [view, setView] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

    const year = view.getFullYear();
    const month = view.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isToday = (d) =>
        d === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

    const monthLabel = view.toLocaleDateString("en-GB", { month: "long", year: "numeric" });

    return (
        <PanelCard
            title="Calendar"
            subtitle={monthLabel}
            action={
                <Box>
                    <IconButton size="small" onClick={() => setView(new Date(year, month - 1, 1))}>
                        <ChevronLeftIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setView(new Date(year, month + 1, 1))}>
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                </Box>
            }
        >
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: "repeat(7, 1fr)",
                    rowGap: 0.5,
                    textAlign: "center"
                }}
            >
                {weekDays.map((w, i) => (
                    <Typography
                        key={i}
                        sx={{ color: "#94A3B8", fontSize: "0.72rem", fontWeight: 600, pb: 0.5 }}
                    >
                        {w}
                    </Typography>
                ))}

                {cells.map((d, i) => (
                    <Box key={i} sx={{ display: "flex", justifyContent: "center" }}>
                        {d && (
                            <Box
                                sx={{
                                    width: 30,
                                    height: 30,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    fontSize: "0.82rem",
                                    fontWeight: isToday(d) ? 700 : 500,
                                    color: isToday(d) ? "#FFFFFF" : "#334155",
                                    bgcolor: isToday(d) ? "#2563EB" : "transparent"
                                }}
                            >
                                {d}
                            </Box>
                        )}
                    </Box>
                ))}
            </Box>
        </PanelCard>
    );
}

export default CalendarCard;
