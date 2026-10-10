import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Box,
    Card,
    Chip,
    CircularProgress,
    Collapse,
    InputAdornment,
    MenuItem,
    Pagination,
    TextField,
    Typography
} from "@mui/material";

import SearchIcon from "@mui/icons-material/SearchOutlined";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";
import { getAuditLogs } from "../../services/auditService";

const TYPE_FILTERS = [
    { value: "", label: "All" },
    { value: "announcement", label: "Announcements" },
    { value: "homework", label: "Homework" },
    { value: "marks", label: "Marks" }
];

const ACTION_STYLE = {
    Created: { bg: "#DCFCE7", color: "#15803D" },
    Edited: { bg: "#DBEAFE", color: "#1D4ED8" },
    Deleted: { bg: "#FEE2E2", color: "#B91C1C" }
};

const TYPE_LABEL = {
    announcement: "Announcement",
    homework: "Homework",
    marks: "Marks"
};

function formatWhen(value) {

    const d = toUtcDate(value);

    return d.toLocaleString(undefined, {
        timeZone: getSchoolTimezone(),
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit"
    });

}

function ActivityLogPage() {

    const navigate = useNavigate();

    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);

    const [search, setSearch] = useState("");
    const [type, setType] = useState("");
    const [action, setAction] = useState("");
    const [role, setRole] = useState("");
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");

    const [openId, setOpenId] = useState(null);

    useEffect(() => {
        const timeout = setTimeout(load, 300);
        return () => clearTimeout(timeout);
    }, [search, type, action, role, from, to, page]);

    async function load() {
        try {
            setLoading(true);
            const response = await getAuditLogs({
                search,
                entity_type: type,
                action,
                role,
                from,
                to,
                page
            });
            if (response.success) {
                setLogs(response.data.logs);
                setTotalPages(response.data.totalPages);
                setTotal(response.data.total);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    function reset(setter) {
        return (e) => { setter(e.target.value); setPage(1); };
    }

    return (

        <Box>

            <Box
                onClick={() => navigate("/dashboard")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748B", cursor: "pointer", mb: 2, width: "fit-content" }}
            >
                <ArrowBackIcon fontSize="small" />
                <Typography sx={{ fontSize: "0.9rem" }}>Back to Dashboard</Typography>
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                Activity Log
            </Typography>

            <Typography sx={{ color: "#64748B", fontSize: "0.9rem", mb: 3 }}>
                Who created, edited or deleted announcements, homework and marks. Entries cannot be changed or removed.
            </Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                {TYPE_FILTERS.map((f) => (
                    <Chip
                        key={f.value}
                        label={f.label}
                        clickable
                        onClick={() => { setType(f.value); setPage(1); }}
                        sx={{
                            fontWeight: 600,
                            bgcolor: type === f.value ? "#1D4ED8" : "#F1F5F9",
                            color: type === f.value ? "white" : "#475569",
                            "&:hover": { bgcolor: type === f.value ? "#1E40AF" : "#E2E8F0" }
                        }}
                    />
                ))}
            </Box>

            <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>

                <TextField
                    placeholder="Search title or person..."
                    value={search}
                    onChange={reset(setSearch)}
                    size="small"
                    sx={{ minWidth: 240 }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" sx={{ color: "#94A3B8" }} />
                            </InputAdornment>
                        )
                    }}
                />

                <TextField select size="small" label="Action" value={action} onChange={reset(setAction)} sx={{ minWidth: 130 }}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Created">Created</MenuItem>
                    <MenuItem value="Edited">Edited</MenuItem>
                    <MenuItem value="Deleted">Deleted</MenuItem>
                </TextField>

                <TextField select size="small" label="By" value={role} onChange={reset(setRole)} sx={{ minWidth: 130 }}>
                    <MenuItem value="">Everyone</MenuItem>
                    <MenuItem value="Teacher">Teachers</MenuItem>
                    <MenuItem value="School Admin">Admins</MenuItem>
                </TextField>

                <TextField size="small" type="date" label="From" value={from} onChange={reset(setFrom)} InputLabelProps={{ shrink: true }} />
                <TextField size="small" type="date" label="To" value={to} onChange={reset(setTo)} InputLabelProps={{ shrink: true }} />

            </Box>

            <Card sx={{ p: { xs: 1, sm: 2 } }}>

                {loading && (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                        <CircularProgress size={28} />
                    </Box>
                )}

                {!loading && logs.length === 0 && (
                    <Typography color="text.secondary" sx={{ p: 2 }}>
                        No activity found.
                    </Typography>
                )}

                {!loading && logs.map((log) => {

                    const style = ACTION_STYLE[log.action] || ACTION_STYLE.Edited;
                    const changes = Array.isArray(log.changes) ? log.changes : [];
                    const open = openId === log.id;

                    return (

                        <Box key={log.id} sx={{ borderBottom: "1px solid #F1F5F9" }}>

                            <Box
                                onClick={() => changes.length > 0 && setOpenId(open ? null : log.id)}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    flexWrap: "wrap",
                                    p: 1.5,
                                    borderRadius: 2,
                                    cursor: changes.length > 0 ? "pointer" : "default",
                                    "&:hover": { bgcolor: changes.length > 0 ? "#F8FAFC" : "transparent" }
                                }}
                            >

                                <Chip
                                    size="small"
                                    label={log.action}
                                    sx={{ bgcolor: style.bg, color: style.color, fontWeight: 700, minWidth: 72 }}
                                />

                                <Box sx={{ flex: 1, minWidth: 220 }}>

                                    <Typography sx={{ fontWeight: 600 }}>
                                        {log.entity_title || "(untitled)"}
                                    </Typography>

                                    <Typography sx={{ color: "#64748B", fontSize: "0.82rem" }}>
                                        {TYPE_LABEL[log.entity_type] || log.entity_type}
                                        {log.summary ? ` · ${log.summary}` : ""}
                                    </Typography>

                                </Box>

                                <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>

                                    <Typography sx={{ fontSize: "0.88rem", fontWeight: 600 }}>
                                        {log.user_name || "Unknown"}
                                        <Typography component="span" sx={{ color: "#64748B", fontSize: "0.78rem", ml: 0.75 }}>
                                            {log.user_role}
                                        </Typography>
                                    </Typography>

                                    <Typography sx={{ color: "#64748B", fontSize: "0.78rem" }}>
                                        {formatWhen(log.created_at)}
                                    </Typography>

                                </Box>

                                {changes.length > 0 && (
                                    <ExpandMoreIcon
                                        fontSize="small"
                                        sx={{ color: "#94A3B8", transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }}
                                    />
                                )}

                            </Box>

                            <Collapse in={open} unmountOnExit>

                                <Box sx={{ px: 2, pb: 2 }}>

                                    {changes.map((c, i) => (

                                        <Box key={i} sx={{ display: "flex", gap: 1, flexWrap: "wrap", py: 0.5, fontSize: "0.88rem" }}>

                                            <Typography sx={{ fontWeight: 600, fontSize: "inherit", minWidth: 150 }}>
                                                {c.field}
                                            </Typography>

                                            <Typography sx={{ color: "#B91C1C", fontSize: "inherit", textDecoration: "line-through" }}>
                                                {c.from}
                                            </Typography>

                                            <Typography sx={{ fontSize: "inherit", color: "#94A3B8" }}>→</Typography>

                                            <Typography sx={{ color: "#15803D", fontSize: "inherit" }}>
                                                {c.to}
                                            </Typography>

                                        </Box>

                                    ))}

                                </Box>

                            </Collapse>

                        </Box>

                    );

                })}

                {totalPages > 1 && (
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                        <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
                    </Box>
                )}

                {!loading && total > 0 && (
                    <Typography sx={{ color: "#94A3B8", fontSize: "0.8rem", textAlign: "center", mt: 1.5 }}>
                        {total} entr{total === 1 ? "y" : "ies"}
                    </Typography>
                )}

            </Card>

        </Box>

    );

}

export default ActivityLogPage;
