import ChildHeader from "../../components/Parent/ChildHeader";
import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
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
            <ChildHeader child={child} kids={children} selectedId={studentId} onSelect={setStudentId} eyebrow="This week at school" />
            {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}
            {!loading && !studentId && (
                <Typography sx={{ color: "text.secondary" }}>No child is linked to your account yet.</Typography>
            )}
            {studentId && <WeeklySummaryCard key={studentId} studentId={studentId} showEmpty />}
        </Box>
    );
}
