import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Alert,
    Avatar,
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
import HistoryIcon from "@mui/icons-material/HistoryRounded";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import MenuBookIcon from "@mui/icons-material/MenuBookOutlined";
import GradeIcon from "@mui/icons-material/GradeOutlined";

import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";
import SchoolDatePicker from "../../components/common/SchoolDatePicker";
import { getAuditLogs } from "../../services/auditService";

const TYPE_FILTERS = [
    { value: "", label: "All" },
    { value: "announcement", label: "Announcements" },
    { value: "homework", label: "Homework" },
    { value: "marks", label: "Marks" }
];

const ACTION_STYLE = {
    Created: { bg: "#DCFCE7", color: "#15803D", dot: "#22C55E" },
    Edited: { bg: "#FEF3C7", color: "#92400E", dot: "#F59E0B" },
    Deleted: { bg: "#FEE2E2", color: "#B91C1C", dot: "#EF4444" }
};

const TYPE_LABEL = {
    announcement: "Announcement",
    homework: "Homework",
    marks: "Marks"
};

const TYPE_ICON = {
    announcement: <CampaignIcon fontSize="small" />,
    homework: <MenuBookIcon fontSize="small" />,
    marks: <GradeIcon fontSize="small" />
};

function dayKey(value) {
    return toUtcDate(value).toLocaleDateString("en-CA", { timeZone: getSchoolTimezone() });
}

function dayLabel(key) {
    const today = new Date().toLocaleDateString("en-CA", { timeZone: getSchoolTimezone() });
    const yesterday = new Date(Date.now() - 86400000).toLocaleDateString("en-CA", { timeZone: getSchoolTimezone() });
    if (key === today) return "Today";
    if (key === yesterday) return "Yesterday";
    const [y, m, d] = key.split("-").map(Number);
    return new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString(undefined, {
        weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC"
    });
}

function timeOf(value) {
    return toUtcDate(value).toLocaleTimeString(undefined, {
        timeZone: getSchoolTimezone(),
        hour: "numeric",
        minute: "2-digit"
    });
}

function pill(active) {
    return {
        fontWeight: 700,
        border: "1px solid",
        borderColor: active ? "var(--sl-ink, #111827)" : "var(--sl-border, #E2E8F0)",
        bgcolor: active ? "var(--sl-accent, #FFC400)" : "#fff",
        color: active ? "var(--sl-ink, #111827)" : "text.secondary",
        "&:hover": { bgcolor: active ? "var(--sl-accent, #FFC400)" : "var(--sl-soft, #F1F5F9)" }
    };
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
    const [error, setError] = useState("");

    useEffect(() => {
        const timeout = setTimeout(load, 300);
        return () => clearTimeout(timeout);
    }, [search, type, action, role, from, to, page]);

    async function load() {
        try {
            setLoading(true);
            setError("");
            const response = await getAuditLogs({ search, entity_type: type, action, role, from, to, page });
            if (response.success) {
                setLogs(response.data.logs);
                setTotalPages(response.data.totalPages);
                setTotal(response.data.total);
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || "Unable to load the activity log. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    function reset(setter) {
        return (e) => { setter(e.target.value); setPage(1); };
    }

    const filtersOn = Boolean(search || type || action || role || from || to);

    // group the page's entries by day (school time zone), keeping the order
    const groups = useMemo(() => {
        const map = new Map();
        logs.forEach((l) => {
            const k = dayKey(l.created_at);
            if (!map.has(k)) map.set(k, []);
            map.get(k).push(l);
        });
        return Array.from(map.entries());
    }, [logs]);

    return (

        <Box sx={{ maxWidth: 1000 }}>

            <Box
                onClick={() => navigate("/dashboard")}
                sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", cursor: "pointer", mb: 1.5, width: "fit-content" }}
            >
                <ArrowBackIcon fontSize="small" />
                <Typography sx={{ fontSize: "0.9rem" }}>Back to Dashboard</Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 46, height: 46, minWidth: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <HistoryIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>Activity Log</Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                        Who created, edited or deleted announcements, homework and marks. Entries can't be changed or removed.
                    </Typography>
                </Box>
                {!loading && total > 0 && (
                    <Chip label={`${total} entr${total === 1 ? "y" : "ies"}`} sx={{ fontWeight: 700, bgcolor: "var(--sl-soft, #F1F5F9)" }} />
                )}
            </Box>

            {/* ---------- filters ---------- */}
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 1.5 }}>
                {TYPE_FILTERS.map((f) => (
                    <Chip
                        key={f.value}
                        label={f.label}
                        clickable
                        onClick={() => { setType(f.value); setPage(1); }}
                        sx={pill(type === f.value)}
                    />
                ))}
            </Box>

            <Box sx={{ display: "flex", gap: 1.25, mb: 2.5, flexWrap: "wrap" }}>
                <TextField
                    placeholder="Search title or person..."
                    value={search}
                    onChange={reset(setSearch)}
                    size="small"
                    sx={{ flex: 1, minWidth: 220 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon fontSize="small" sx={{ color: "#94A3B8" }} />
                                </InputAdornment>
                            )
                        }
                    }}
                />
                <TextField select size="small" label="Action" value={action} onChange={reset(setAction)} sx={{ minWidth: 120 }}>
                    <MenuItem value="">All</MenuItem>
                    <MenuItem value="Created">Created</MenuItem>
                    <MenuItem value="Edited">Edited</MenuItem>
                    <MenuItem value="Deleted">Deleted</MenuItem>
                </TextField>
                <TextField select size="small" label="By" value={role} onChange={reset(setRole)} sx={{ minWidth: 120 }}>
                    <MenuItem value="">Everyone</MenuItem>
                    <MenuItem value="Teacher">Teachers</MenuItem>
                    <MenuItem value="School Admin">Admins</MenuItem>
                </TextField>
                <SchoolDatePicker label="From" size="small" value={from} onChange={(v) => { setFrom(v); setPage(1); }} sx={{ width: 160 }} />
                <SchoolDatePicker label="To" size="small" value={to} onChange={(v) => { setTo(v); setPage(1); }} sx={{ width: 160 }} />
            </Box>

            {/* ---------- timeline ---------- */}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}>
                    <CircularProgress size={28} />
                </Box>
            )}

            {!loading && error && <Alert severity="error">{error}</Alert>}

            {!loading && !error && logs.length === 0 && (
                <Card sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px solid var(--sl-border)", boxShadow: "var(--sl-card-shadow)" }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>
                        {filtersOn ? "No activity matches these filters" : "No activity yet"}
                    </Typography>
                    <Typography color="text.secondary">
                        {filtersOn ? "Try clearing a filter or searching a different word." : "Changes to announcements, homework and marks will show up here."}
                    </Typography>
                </Card>
            )}

            {!loading && groups.map(([key, items]) => (

                <Box key={key} sx={{ mb: 2.5 }}>

                    <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.4, color: "text.secondary", mb: 0.75 }}>
                        {dayLabel(key).toUpperCase()} ({items.length})
                    </Typography>

                    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>

                        {items.map((log) => {

                            const style = ACTION_STYLE[log.action] || ACTION_STYLE.Edited;
                            const changes = Array.isArray(log.changes) ? log.changes : [];
                            const open = openId === log.id;
                            const who = log.user_name || "Unknown";

                            return (

                                <Box
                                    key={log.id}
                                    data-testid="log-row"
                                    sx={{
                                        borderRadius: 3,
                                        bgcolor: "#fff",
                                        border: "1px solid var(--sl-border, #E2E8F0)",
                                        borderLeft: `4px solid ${style.dot}`,
                                        boxShadow: "var(--sl-card-shadow, none)",
                                        overflow: "hidden"
                                    }}
                                >
                                    <Box
                                        onClick={() => changes.length > 0 && setOpenId(open ? null : log.id)}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            flexWrap: "wrap",
                                            p: 1.5,
                                            cursor: changes.length > 0 ? "pointer" : "default"
                                        }}
                                    >
                                        <Chip
                                            size="small"
                                            label={log.action}
                                            sx={{ bgcolor: style.bg, color: style.color, fontWeight: 800, minWidth: 74 }}
                                        />

                                        <Box sx={{ flex: 1, minWidth: 200 }}>
                                            <Typography sx={{ fontWeight: 700, overflowWrap: "anywhere" }}>
                                                {log.entity_title || "(untitled)"}
                                            </Typography>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", fontSize: "0.8rem" }}>
                                                {TYPE_ICON[log.entity_type]}
                                                <span>
                                                    {TYPE_LABEL[log.entity_type] || log.entity_type}
                                                    {log.summary ? ` · ${log.summary}` : ""}
                                                </span>
                                            </Box>
                                        </Box>

                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Avatar sx={{ width: 30, height: 30, fontSize: "0.8rem", fontWeight: 800, bgcolor: "var(--sl-soft, #EEF2FF)", color: "var(--sl-ink, #4F46E5)" }}>
                                                {who[0]}
                                            </Avatar>
                                            <Box>
                                                <Typography sx={{ fontSize: "0.85rem", fontWeight: 700, lineHeight: 1.2 }}>{who}</Typography>
                                                <Typography sx={{ color: "text.secondary", fontSize: "0.74rem" }}>
                                                    {log.user_role} · {timeOf(log.created_at)}
                                                </Typography>
                                            </Box>
                                        </Box>

                                        {changes.length > 0 ? (
                                            <ExpandMoreIcon
                                                fontSize="small"
                                                sx={{ color: "#94A3B8", transform: open ? "rotate(180deg)" : "none", transition: "0.2s" }}
                                            />
                                        ) : (
                                            <Box sx={{ width: 20 }} />
                                        )}
                                    </Box>

                                    <Collapse in={open} unmountOnExit>
                                        <Box sx={{ mx: 1.5, mb: 1.5, p: 1.5, borderRadius: 2.5, bgcolor: "var(--sl-page2, #F8FAFC)" }}>
                                            {changes.map((c, i) => (
                                                <Box key={i} sx={{ display: "flex", gap: 1, flexWrap: "wrap", py: 0.5, fontSize: "0.86rem" }}>
                                                    <Typography sx={{ fontWeight: 700, fontSize: "inherit", minWidth: 140 }}>
                                                        {c.field}
                                                    </Typography>
                                                    <Typography sx={{ color: "#B91C1C", fontSize: "inherit", textDecoration: "line-through", overflowWrap: "anywhere" }}>
                                                        {String(c.from ?? "")}
                                                    </Typography>
                                                    <Typography sx={{ fontSize: "inherit", color: "#94A3B8" }}>→</Typography>
                                                    <Typography sx={{ color: "#15803D", fontSize: "inherit", overflowWrap: "anywhere" }}>
                                                        {String(c.to ?? "")}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    </Collapse>
                                </Box>

                            );

                        })}

                    </Box>

                </Box>

            ))}

            {totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Pagination count={totalPages} page={page} onChange={(e, v) => setPage(v)} color="primary" />
                </Box>
            )}

        </Box>

    );

}

export default ActivityLogPage;
