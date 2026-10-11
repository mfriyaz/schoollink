import { useEffect, useState } from "react";

import { Box, CircularProgress, MenuItem, TextField, Typography } from "@mui/material";

import WeeklySummaryCard from "../../components/Parent/WeeklySummaryCard";
import { getMyChildren } from "../../services/postService";

/** "This Week" tab for parents: the weekly summary of the selected child. */
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

    return (
        <Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", mb: 1.5 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, flex: 1 }}>This Week</Typography>
                {children.length > 1 && (
                    <TextField
                        select
                        size="small"
                        label="Child"
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        sx={{ minWidth: { xs: "100%", sm: 200 } }}
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
