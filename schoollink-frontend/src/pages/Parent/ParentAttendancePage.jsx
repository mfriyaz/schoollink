import ChildHeader from "../../components/Parent/ChildHeader";
import { useEffect, useState } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import ParentAttendanceCard from "../../components/Parent/ParentAttendanceCard";
import { getCalendar } from "../../services/calendarService";
import { getSchoolTimezone } from "../../utils/dateUtils";
import { getMyChildren, getAttendanceForStudent } from "../../services/postService";
/** Attendance page for parents: today and this month for the selected child. */
export default function ParentAttendancePage() {
    const [children, setChildren] = useState([]);
    const [studentId, setStudentId] = useState("");
    const [loading, setLoading] = useState(true);
    const [attendance, setAttendance] = useState([]);
    const [calendar, setCalendar] = useState(null);
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
    useEffect(() => {
        const dayFmt = new Intl.DateTimeFormat("en-CA", { timeZone: getSchoolTimezone() });
        const today = dayFmt.format(new Date());
        const end = new Date();
        end.setDate(end.getDate() + 120);
        getCalendar(`${today.slice(0, 7)}-01`, dayFmt.format(end))
            .then((r) => { if (r.success) setCalendar(r.data); })
            .catch(() => { /* calendar is optional */ });
    }, []);
    useEffect(() => {
        if (!studentId) return;
        setAttendance([]);
        getAttendanceForStudent(studentId)
            .then((r) => { if (r.success) setAttendance(r.data.slice(0, 30)); })
            .catch(() => { /* shown as empty */ });
    }, [studentId]);
    const child = children.find((c) => c.student_id === studentId);
    return (
        <Box sx={{ maxWidth: 720 }}>
            <ChildHeader child={child} kids={children} selectedId={studentId} onSelect={setStudentId} eyebrow="Attendance" />
            {loading && <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}><CircularProgress /></Box>}
            {!loading && !studentId && (
                <Typography sx={{ color: "text.secondary" }}>No child is linked to your account yet.</Typography>
            )}
            {studentId && <ParentAttendanceCard attendance={attendance} calendar={calendar} />}
        </Box>
    );
}
