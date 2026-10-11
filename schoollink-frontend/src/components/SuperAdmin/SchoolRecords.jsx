import { useEffect, useState } from "react";

import {
    Alert, Box, Chip, CircularProgress, InputAdornment, Pagination,
    Tab, Tabs, TextField, Typography, useMediaQuery
} from "@mui/material";
import SearchIcon from "@mui/icons-material/SearchOutlined";

import { getSchoolRecords } from "../../services/platformAdminService";
import { bytesLabel, fmtDate, timeAgo } from "../../utils/platformUi";

const active = (v) => <Chip size="small" color={v ? "success" : "default"} variant="outlined" label={v ? "Active" : "Inactive"} />;
const yesNo = (v) => <Chip size="small" color={v ? "success" : "default"} variant="outlined" label={v ? "Yes" : "No"} />;
const classSec = (r) => [r.class_name, r.section_name].filter(Boolean).join(" - ") || "-";

/** Each tab: label, searchable?, columns. The first column is the row title on phones. */
const tabs = {

    students: {
        label: "Students", search: "Search name, admission no, phone",
        columns: [
            { label: "Student", render: (r) => r.name, sub: (r) => `Adm. ${r.admission_no}` },
            { label: "Class", render: classSec },
            { label: "Parent contact", render: (r) => [r.parent_phone, r.parent_email].filter(Boolean).join(" / ") || "-" },
            { label: "Parent accounts", render: (r) => r.parent_accounts },
            { label: "Status", render: (r) => active(r.is_active) }
        ]
    },

    teachers: {
        label: "Teachers", search: "Search name, email, employee no",
        columns: [
            { label: "Teacher", render: (r) => r.name, sub: (r) => r.employee_no },
            { label: "Contact", render: (r) => [r.email, r.phone].filter(Boolean).join(" / ") || "-" },
            { label: "Subject assignments", render: (r) => r.assignments },
            { label: "Has login", render: (r) => yesNo(r.has_login) },
            { label: "Last login", render: (r) => timeAgo(r.last_login) },
            { label: "Status", render: (r) => active(r.is_active) }
        ]
    },

    parents: {
        label: "Parents", search: "Search name, email, username, mobile",
        columns: [
            { label: "Parent", render: (r) => r.name, sub: (r) => r.email || (r.username ? `@${r.username}` : "") },
            { label: "Children", render: (r) => r.children || "-" },
            { label: "Mobile", render: (r) => r.mobile || "-" },
            { label: "Last login", render: (r) => timeAgo(r.last_login) },
            { label: "Status", render: (r) => active(r.is_active) }
        ]
    },

    classes: {
        label: "Classes", search: "Search class",
        columns: [
            { label: "Class", render: (r) => r.class_name },
            { label: "Students", render: (r) => r.students },
            {
                label: "Sections", render: (r) => (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {r.sections.length === 0 && "-"}
                        {r.sections.map((s) => (
                            <Chip key={s.section} size="small" variant="outlined"
                                label={`${s.section}: ${s.students}${s.capacity ? `/${s.capacity}` : ""}${s.class_teacher ? ` (${s.class_teacher})` : ""}`} />
                        ))}
                    </Box>
                )
            }
        ]
    },

    homework: {
        label: "Homework", search: "Search title, subject, teacher",
        columns: [
            { label: "Title", render: (r) => r.title, sub: (r) => `${r.subject_name || ""}` },
            { label: "Class", render: classSec },
            { label: "Teacher", render: (r) => r.teacher || "-" },
            { label: "Date / due", render: (r) => `${fmtDate(r.homework_date)} / ${fmtDate(r.due_date)}` },
            { label: "Priority", render: (r) => r.priority || "-" },
            { label: "Posted", render: (r) => timeAgo(r.created_at) }
        ]
    },

    announcements: {
        label: "Announcements", search: "Search title or text",
        columns: [
            { label: "Title", render: (r) => r.title },
            { label: "Audience", render: (r) => r.target_audience || "-" },
            { label: "Publish / expiry", render: (r) => `${fmtDate(r.publish_date)} / ${r.expiry_date ? fmtDate(r.expiry_date) : "no expiry"}` },
            { label: "Status", render: (r) => active(r.is_active) },
            { label: "Posted", render: (r) => timeAgo(r.created_at) }
        ]
    },

    attendance: {
        label: "Attendance", noSearch: true,
        columns: [
            { label: "Date", render: (r) => fmtDate(r.date) },
            {
                label: "Marked students", render: (r) => (
                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {Object.entries(r.statuses).map(([k, v]) => (
                            <Chip key={k} size="small" variant="outlined"
                                color={/present/i.test(k) ? "success" : /absent/i.test(k) ? "error" : "default"} label={`${k}: ${v}`} />
                        ))}
                    </Box>
                )
            },
            { label: "Total", render: (r) => r.total }
        ]
    },

        files: {
        label: "Files", search: "Search file name, uploader or type (image, audio, document)",
        columns: [
            { label: "File", render: (r) => r.filename || "-", sub: (r) => r.uploaded_by ? `by ${r.uploaded_by}` : (r.source === "backfill" ? "existing file" : "") },
            { label: "Type", render: (r) => r.kind },
            { label: "Size", render: (r) => bytesLabel(r.bytes) },
            { label: "Uploaded", render: (r) => timeAgo(r.created_at) }
        ]
    },

    activity: {
        label: "Activity", search: "Search who or what",
        columns: [
            { label: "What happened", render: (r) => r.summary || `${r.action} ${r.entity_type}`, sub: (r) => `${r.user_name || "?"} (${r.user_role || ""})` },
            { label: "Type", render: (r) => `${r.action} - ${r.entity_type}` },
            { label: "When", render: (r) => timeAgo(r.created_at) }
        ]
    },

    logins: {
        label: "Users & logins", search: "Search name, email, username",
        columns: [
            { label: "User", render: (r) => r.name, sub: (r) => r.email || (r.username ? `@${r.username}` : "") },
            { label: "Role", render: (r) => r.role },
            { label: "Last login", render: (r) => timeAgo(r.last_login) },
            { label: "Status", render: (r) => active(r.is_active) }
        ]
    }

};

export default function SchoolRecords({ schoolId }) {

    const isMobile = useMediaQuery("(max-width:899px)");

    const [type, setType] = useState("students");
    const [search, setSearch] = useState("");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);
    const [raw, setRaw] = useState(null);
    const [error, setError] = useState("");

    const cfg = tabs[type];

    // Ignore results that belong to a different tab (avoids a flash of mismatched rows)
    const data = raw && raw._type === type ? raw : null;

    useEffect(() => {
        const t = setTimeout(() => { setQuery(search); setPage(1); }, 350);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {

        setRaw(null);
        setError("");

        getSchoolRecords(schoolId, type, { search: query || undefined, page, limit: 20 })
            .then((res) => setRaw({ ...res.data, _type: type }))
            .catch((err) => setError(err.response?.data?.message || "Unable to load these records."));

    }, [schoolId, type, query, page]);

    function changeTab(_, value) {
        setType(value);
        setSearch("");
        setQuery("");
        setPage(1);
    }

    const pages = data ? Math.max(1, Math.ceil(data.total / data.limit)) : 1;

    return (

        <Box>

            <Alert severity="info" sx={{ mb: 2 }}>
                Read-only view of this school's own records. Opening it is noted in the platform activity log.
            </Alert>

            <Tabs value={type} onChange={changeTab} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile sx={{ mb: 2, borderBottom: "1px solid #E2E8F0" }}>
                {Object.entries(tabs).map(([k, v]) => <Tab key={k} value={k} label={v.label} sx={{ textTransform: "none", fontWeight: 600 }} />)}
            </Tabs>

            {!cfg.noSearch && (
                <TextField size="small" fullWidth placeholder={cfg.search} value={search} onChange={(e) => setSearch(e.target.value)}
                    sx={{ mb: 2, maxWidth: 420 }}
                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> } }} />
            )}

            {error && <Alert severity="error">{error}</Alert>}

            {!data && !error && <Box sx={{ display: "flex", justifyContent: "center", py: 5 }}><CircularProgress /></Box>}

            {data && (
                <>
                    <Typography sx={{ color: "#64748B", fontSize: "0.82rem", mb: 1 }}>
                        {data.total} record{data.total === 1 ? "" : "s"}{type === "attendance" ? " (last 30 days)" : ""}
                    </Typography>

                    {data.rows.length === 0 && <Typography sx={{ color: "#94A3B8", py: 3 }}>No records found.</Typography>}

                    {data.rows.length > 0 && !isMobile && (
                        <Box sx={{ overflowX: "auto", border: "1px solid #EEF2F7", borderRadius: 2, bgcolor: "#fff" }}>
                            <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
                                <thead>
                                    <tr>
                                        {cfg.columns.map((c) => (
                                            <Box component="th" key={c.label} sx={{ textAlign: "left", p: 1.25, color: "#64748B", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: 0.3, bgcolor: "#F8FAFC", borderBottom: "1px solid #EEF2F7", whiteSpace: "nowrap" }}>
                                                {c.label}
                                            </Box>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.rows.map((r, i) => (
                                        <tr key={r.id ?? r.date ?? i}>
                                            {cfg.columns.map((c, ci) => (
                                                <Box component="td" key={c.label} sx={{ p: 1.25, borderBottom: "1px solid #F1F5F9", verticalAlign: "top" }}>
                                                    {c.render(r)}
                                                    {ci === 0 && c.sub && c.sub(r) && (
                                                        <Typography sx={{ color: "#94A3B8", fontSize: "0.74rem" }}>{c.sub(r)}</Typography>
                                                    )}
                                                </Box>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </Box>
                        </Box>
                    )}

                    {data.rows.length > 0 && isMobile && data.rows.map((r, i) => (
                        <Box key={r.id ?? r.date ?? i} sx={{ p: 1.5, mb: 1, bgcolor: "#fff", border: "1px solid #EEF2F7", borderRadius: 2 }}>
                            <Typography sx={{ fontWeight: 600, fontSize: "0.92rem", overflowWrap: "anywhere" }}>{cfg.columns[0].render(r)}</Typography>
                            {cfg.columns[0].sub && cfg.columns[0].sub(r) && (
                                <Typography sx={{ color: "#94A3B8", fontSize: "0.76rem" }}>{cfg.columns[0].sub(r)}</Typography>
                            )}
                            {cfg.columns.slice(1).map((c) => (
                                <Box key={c.label} sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, mt: 0.5, alignItems: "center" }}>
                                    <Typography sx={{ color: "#94A3B8", fontSize: "0.76rem", flexShrink: 0 }}>{c.label}</Typography>
                                    <Box sx={{ fontSize: "0.84rem", textAlign: "right", minWidth: 0, overflowWrap: "anywhere" }}>{c.render(r)}</Box>
                                </Box>
                            ))}
                        </Box>
                    ))}

                    {pages > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                            <Pagination count={pages} page={page} onChange={(_, v) => setPage(v)} size={isMobile ? "small" : "medium"} />
                        </Box>
                    )}
                </>
            )}

        </Box>

    );

}
