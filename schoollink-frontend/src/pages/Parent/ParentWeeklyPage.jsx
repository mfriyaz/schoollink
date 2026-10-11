import { useEffect, useState } from "react";

import { Avatar, Box, CircularProgress, MenuItem, TextField, Typography } from "@mui/material";

import WeeklySummaryCard from "../../components/Parent/WeeklySummaryCard";
import { getMyChildren } from "../../services/postService";

/** "This Week" page for parents: the weekly summary of the selected child. */
export default function ParentWeeklyPage() {

    const [children, setChildren] = useState([]);
    const [studentId, setStudentId] = useState("");
    const [loading, setLoading] = useState(true);

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
    }, []);

    const child = children.find((c) => c.student_id === studentId);

    return (
        <Box sx={{ maxWidth: 720 }}>

            {/* Same name bar as the Home screen */}
            <Box
                sx={{
                    mb: 1.5,
                    px: { xs: 1.5, md: 2 },
                    py: { xs: 1, md: 1.1 },
                    borderRadius: 3,
                    color: "var(--sl-on-banner)",
                    bgcolor: "var(--sl-banner)",
                    border: "var(--sl-banner-border)",
                    display: "flex",
                    alignItems: "center",
                    gap: 1.25,
                    flexWrap: "wrap"
                }}
            >
                <Avatar
                    sx={{
                        width: 34,
                        height: 34,
                        bgcolor: "color-mix(in srgb, var(--sl-on-banner) 14%, transparent)",
                        color: "var(--sl-on-banner)",
                        fontWeight: 700,
                        fontSize: "0.95rem"
                    }}
                >
                    {child ? child.first_name[0] : "?"}
                </Avatar>

                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.2 }} noWrap>
                        {child ? `${child.first_name} ${child.last_name || ""}` : "Your child"}
                        {child && (
                            <Box component="span" sx={{ fontWeight: 500, opacity: 0.85, fontSize: "0.8rem", ml: 1 }}>
                                {child.class_name} - {child.section_name}
                            </Box>
                        )}
                    </Typography>
                    <Typography sx={{ opacity: 0.85, fontSize: "0.74rem", lineHeight: 1.3 }} noWrap>
                        This week at school
                    </Typography>
                </Box>

                {children.length > 1 && (
                    <TextField
                        select
                        size="small"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        sx={{
                            minWidth: { xs: "100%", sm: 170 },
                            "& .MuiOutlinedInput-root": { bgcolor: "rgba(255,255,255,0.95)", borderRadius: 2, fontSize: "0.85rem" },
                            "& .MuiSelect-select": { py: 0.6 }
                        }}
                    >
                        {children.map((c) => (
                            <MenuItem key={c.student_id} value={c.student_id}>{c.first_name} {c.last_name}</MenuItem>
                        ))}
                    </TextField>
                )}
            </Box>

            {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}

            {!loading && !studentId && (
                <Typography sx={{ color: "text.secondary" }}>No child is linked to your account yet.</Typography>
            )}

            {studentId && <WeeklySummaryCard key={studentId} studentId={studentId} showEmpty />}

        </Box>
    );
}
