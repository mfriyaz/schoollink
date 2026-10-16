import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Card,
    Chip,
    CircularProgress,
    InputAdornment,
    MenuItem,
    TextField,
    Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackOutlined";
import CampaignIcon from "@mui/icons-material/CampaignOutlined";
import SearchIcon from "@mui/icons-material/SearchRounded";
import EventBusyIcon from "@mui/icons-material/EventBusyOutlined";
import StatChips from "../../components/common/StatChips";
import { getExpiredAnnouncements } from "../../services/postService";
import { toUtcDate, getSchoolTimezone } from "../../utils/dateUtils";
const PAGE = 20;
const DAY = 24 * 60 * 60 * 1000;
function daysAgo(date) {
    const d = Math.floor((Date.now() - date.getTime()) / DAY);
    if (d <= 0) return "today";
    if (d === 1) return "yesterday";
    if (d < 30) return `${d} days ago`;
    const m = Math.floor(d / 30);
    return m === 1 ? "1 month ago" : `${m} months ago`;
}
function ExpiredAnnouncementsPage() {
    const navigate = useNavigate();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [audience, setAudience] = useState("all");
    const [sort, setSort] = useState("newest");
    const [filter, setFilter] = useState("all");
    const [visible, setVisible] = useState(PAGE);
    useEffect(() => {
        loadExpired();
    }, []);
    async function loadExpired() {
        try {
            setLoading(true);
            setError("");
            const response = await getExpiredAnnouncements();
            if (response.success) {
                setAnnouncements(response.data);
            } else {
                setError(response.message || "Unable to load expired announcements.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to load expired announcements.");
        } finally {
            setLoading(false);
        }
    }
    const tz = getSchoolTimezone();
    const items = useMemo(() => announcements.map((a) => {
        const date = toUtcDate(a.expiry_date);
        return {
            ...a,
            _date: date,
            _time: date.getTime(),
            _month: date.toLocaleDateString(undefined, { month: "long", year: "numeric", timeZone: tz }),
            _day: date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric", timeZone: tz })
        };
    }), [announcements, tz]);
    const audiences = useMemo(
        () => Array.from(new Set(items.map((a) => a.target_audience).filter(Boolean))),
        [items]
    );
    const now = Date.now();
    const last7 = items.filter((a) => now - a._time <= 7 * DAY).length;
    const last30 = items.filter((a) => now - a._time <= 30 * DAY).length;
    const stats = [
        { label: "Expired in total", value: items.length, filter: "all" },
        { label: "Last 7 days", value: last7, filter: "7", tone: "#B45309" },
        { label: "Last 30 days", value: last30, filter: "30", tone: "#B45309" },
        { label: "Older", value: items.length - last30, filter: "old", tone: "#475569" }
    ];
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        const list = items.filter((a) => {
            if (audience !== "all" && a.target_audience !== audience) return false;
            if (filter === "7" && now - a._time > 7 * DAY) return false;
            if (filter === "30" && now - a._time > 30 * DAY) return false;
            if (filter === "old" && now - a._time <= 30 * DAY) return false;
            if (q && !String(a.title || "").toLowerCase().includes(q)) return false;
            return true;
        });
        return list.sort((x, y) => (sort === "newest" ? y._time - x._time : x._time - y._time));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items, search, audience, filter, sort]);
    const shown = filtered.slice(0, visible);
    // group by month, keeping the sort order
    const groups = useMemo(() => {
        const map = new Map();
        shown.forEach((a) => {
            if (!map.has(a._month)) map.set(a._month, []);
            map.get(a._month).push(a);
        });
        return Array.from(map.entries());
    }, [shown]);
    return (
        <Box sx={{ maxWidth: 900 }}>
            <Box
                role="button"
                tabIndex={0}
                onClick={() => navigate("/posts")}
                sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, px: 1.5, py: 0.55, mb: 1.5, borderRadius: 99, cursor: "pointer", fontSize: "0.82rem", fontWeight: 700, color: "var(--sl-ink)", border: "1.5px solid var(--sl-ink)", "&:hover": { bgcolor: "var(--sl-soft)" } }}
            >
                <ArrowBackIcon sx={{ fontSize: 18 }} />
                Back to All Posts
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <Box sx={{ width: 46, height: 46, minWidth: 46, borderRadius: "14px", bgcolor: "var(--sl-accent)", border: "1.5px solid var(--sl-ink)", boxShadow: "2px 2px 0 var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <EventBusyIcon sx={{ color: "var(--sl-ink)" }} />
                </Box>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 800, fontSize: { xs: "1.3rem", md: "1.55rem" }, lineHeight: 1.2, color: "var(--sl-ink)" }}>Expired Announcements</Typography>
                    <Typography sx={{ fontSize: "0.82rem", color: "text.secondary" }}>
                        Past their expiry date, so no longer shown to teachers or parents
                    </Typography>
                </Box>
            </Box>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            )}
            {!loading && !error && items.length === 0 && (
                <Card sx={{ p: 4, textAlign: "center", borderRadius: 3 }}>
                    <Typography sx={{ fontWeight: 700, mb: 0.5 }}>Nothing has expired yet</Typography>
                    <Typography color="text.secondary">
                        When an announcement passes its expiry date it will appear here.
                    </Typography>
                </Card>
            )}
            {!loading && items.length > 0 && (
                <>
                    <StatChips items={stats} active={filter} onPick={(f) => { setFilter(f); setVisible(PAGE); }} />
                    <Box sx={{ display: "flex", gap: 1, mb: 1.5, flexWrap: "wrap" }}>
                        <TextField
                            size="small"
                            placeholder="Search by title"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setVisible(PAGE); }}
                            sx={{ flex: 1, minWidth: 200 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                                    )
                                }
                            }}
                        />
                        {audiences.length > 1 && (
                            <TextField select size="small" label="Audience" value={audience} onChange={(e) => { setAudience(e.target.value); setVisible(PAGE); }} sx={{ minWidth: 140 }}>
                                <MenuItem value="all">All audiences</MenuItem>
                                {audiences.map((a) => <MenuItem key={a} value={a}>{a}</MenuItem>)}
                            </TextField>
                        )}
                        <TextField select size="small" label="Sort" value={sort} onChange={(e) => setSort(e.target.value)} sx={{ minWidth: 130 }}>
                            <MenuItem value="newest">Newest first</MenuItem>
                            <MenuItem value="oldest">Oldest first</MenuItem>
                        </TextField>
                    </Box>
                    {filtered.length === 0 && (
                        <Card sx={{ p: 3, textAlign: "center", color: "text.secondary", borderRadius: 3 }}>
                            No announcements match your search.
                        </Card>
                    )}
                    {groups.map(([month, list]) => (
                        <Box key={month} sx={{ mb: 2 }}>
                            <Typography sx={{ fontSize: "0.74rem", fontWeight: 800, letterSpacing: 0.4, color: "text.secondary", mb: 0.75 }}>
                                {month.toUpperCase()} ({list.length})
                            </Typography>
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                {list.map((a) => (
                                    <Box
                                        key={a.id}
                                        data-testid="expired-row"
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            p: 1.5,
                                            borderRadius: 3,
                                            bgcolor: "#fff",
                                            border: "1px solid var(--sl-border, #E2E8F0)",
                                            borderLeft: "6px solid var(--sl-soft2, #E2E8F0)",
                                            boxShadow: "var(--sl-card-shadow, none)"
                                        }}
                                    >
                                        <Box sx={{ width: 40, height: 40, borderRadius: 2.5, bgcolor: "var(--sl-soft)", border: "1.5px solid var(--sl-ink)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                            <CampaignIcon sx={{ color: "var(--sl-ink)" }} fontSize="small" />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography sx={{ fontWeight: 800, color: "var(--sl-ink)", wordBreak: "break-word" }}>{a.title}</Typography>
                                            <Typography sx={{ fontSize: "0.8rem", color: "text.secondary" }}>
                                                Expired {a._day} · {daysAgo(a._date)}
                                            </Typography>
                                        </Box>
                                        {a.target_audience && (
                                            <Chip size="small" label={a.target_audience} sx={{ bgcolor: "var(--sl-soft, #EEF2FF)", color: "var(--sl-ink)", border: "1.5px solid var(--sl-ink)", fontWeight: 700 }} />
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    ))}
                    {filtered.length > visible && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                            <Button variant="outlined" onClick={() => setVisible((v) => v + PAGE)}>
                                Show more ({filtered.length - visible} left)
                            </Button>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
}
export default ExpiredAnnouncementsPage;
