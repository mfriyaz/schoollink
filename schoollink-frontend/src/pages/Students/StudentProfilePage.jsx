import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert, Box, Button, Card, Skeleton, Table, TableBody, TableCell, TableHead, TableRow, TextField, Typography
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBackRounded";

import PageHeader from "../../components/common/PageHeader";
import { getStudentProfile } from "../../services/studentProfileService";
import { addFollowup } from "../../services/attentionService";

const STATE_COLORS = {
    present: { bg: "#BBF7D0", label: "Present" },
    late: { bg: "#FDE68A", label: "Late" },
    half: { bg: "#FED7AA", label: "Half day" },
    absent: { bg: "#FCA5A5", label: "Absent" },
    leave: { bg: "var(--sl-soft2)", label: "Absent, on leave" }
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Section({ title, note, children, sx }) {
    return (
        <Card sx={{ p: { xs: 2, sm: 2.5 }, ...sx }}>
            <Typography sx={{ fontWeight: 800, fontSize: "1rem" }}>{title}</Typography>
            {note && <Typography sx={{ color: "text.secondary", fontSize: "0.8rem", mb: 1.5 }}>{note}</Typography>}
            {!note && <Box sx={{ mb: 1.5 }} />}
            {children}
        </Card>
    );
}

function Stat({ label, value, tone }) {
    return (
        <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", color: "text.secondary" }}>{label}</Typography>
            <Typography sx={{ fontWeight: 800, fontSize: "1.35rem", lineHeight: 1.2, color: tone || "var(--sl-ink)" }}>{value}</Typography>
        </Box>
    );
}

function Row({ label, children }) {
    return (
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, py: 0.9, borderBottom: "1px solid var(--sl-border)", "&:last-of-type": { borderBottom: 0 } }}>
            <Typography sx={{ color: "text.secondary", fontSize: "0.86rem" }}>{label}</Typography>
            <Typography component="div" sx={{ fontSize: "0.9rem", fontWeight: 600, textAlign: "right", overflowWrap: "anywhere" }}>{children || "-"}</Typography>
        </Box>
    );
}

/** Calendar of the last ~13 weeks, one cell per day, Monday first */
function AttendanceCalendar({ days, asOf }) {

    const byDate = new Map(days.map((d) => [d.date, d.leave ? "leave" : d.state]));

    const end = new Date(`${asOf}T00:00:00Z`);

    const start = new Date(end);

    start.setUTCDate(start.getUTCDate() - 90);

    // back up to the Monday on or before the start
    const shift = (start.getUTCDay() + 6) % 7;

    start.setUTCDate(start.getUTCDate() - shift);

    const cells = [];

    for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {

        const iso = d.toISOString().slice(0, 10);

        cells.push({ iso, state: byDate.get(iso) || null, day: d.getUTCDate(), month: d.getUTCMonth() });

    }

    const weeks = [];

    for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));

    return (
        <Box>
            <Box sx={{ display: "grid", gridTemplateColumns: "36px repeat(7, 1fr)", gap: 0.5, alignItems: "center", maxWidth: 420 }}>
                <span />
                {["M", "T", "W", "T", "F", "S", "S"].map((l, i) => (
                    <Typography key={i} sx={{ textAlign: "center", fontSize: "0.68rem", color: "text.secondary", fontWeight: 700 }}>{l}</Typography>
                ))}
                {weeks.map((w, wi) => (
                    <Box key={wi} sx={{ display: "contents" }}>
                        <Typography sx={{ fontSize: "0.66rem", color: "text.secondary" }}>
                            {wi === 0 || w[0].day <= 7 ? MONTHS[w[0].month] : ""}
                        </Typography>
                        {w.map((c) => (
                            <Box
                                key={c.iso}
                                title={`${c.iso}${c.state ? ` - ${STATE_COLORS[c.state].label}` : ""}`}
                                data-state={c.state || "none"}
                                sx={{
                                    height: 22, borderRadius: "4px",
                                    bgcolor: c.state ? STATE_COLORS[c.state].bg : "transparent",
                                    border: c.state ? "none" : "1px dashed var(--sl-border)",
                                    opacity: c.iso > asOf ? 0 : 1
                                }}
                            />
                        ))}
                    </Box>
                ))}
            </Box>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 1.5 }}>
                {Object.entries(STATE_COLORS).map(([k, v]) => (
                    <Box key={k} sx={{ display: "flex", alignItems: "center", gap: 0.6, fontSize: "0.74rem", color: "text.secondary" }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "3px", bgcolor: v.bg }} />{v.label}
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

/** Small line chart of exam percentages (oldest on the left) */
function MarksChart({ marks }) {

    const W = 320, H = 130, PADL = 30, PADR = 14, PADT = 12, PADB = 26;

    const pts = marks.map((m, i) => ({
        x: marks.length === 1 ? (W + PADL - PADR) / 2 : PADL + (i * (W - PADL - PADR)) / (marks.length - 1),
        y: PADT + ((100 - (m.percent || 0)) / 100) * (H - PADT - PADB),
        m
    }));

    return (
        <Box sx={{ maxWidth: 460 }}>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label="Marks by exam">
                {[0, 50, 100].map((g) => {
                    const y = PADT + ((100 - g) / 100) * (H - PADT - PADB);
                    return (
                        <g key={g}>
                            <line x1={PADL} x2={W - PADR} y1={y} y2={y} stroke="var(--sl-border)" strokeWidth="1" />
                            <text x={PADL - 6} y={y + 3} textAnchor="end" fontSize="9" fill="#64748B">{g}</text>
                        </g>
                    );
                })}
                {pts.length > 1 && (
                    <polyline fill="none" stroke="var(--sl-primary)" strokeWidth="2" points={pts.map((p) => `${p.x},${p.y}`).join(" ")} />
                )}
                {pts.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="4" fill="var(--sl-primary)" />
                        <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--sl-ink)">{p.m.percent}%</text>
                        <text x={p.x} y={H - 8} textAnchor="middle" fontSize="8.5" fill="#64748B">{String(p.m.exam_name).slice(0, 12)}</text>
                    </g>
                ))}
            </svg>
        </Box>
    );
}

function monthLabel(key) {
    const [y, m] = key.split("-");
    return `${MONTHS[Number(m) - 1]} ${y.slice(2)}`;
}

function StudentProfilePage() {

    const { id } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [note, setNote] = useState("");
    const [noteBusy, setNoteBusy] = useState(false);
    const [noteError, setNoteError] = useState("");

    const reload = () => getStudentProfile(id)
        .then((res) => setData(res.data))
        .catch((err) => setError(err.response?.data?.message || "Unable to load this student."));

    useEffect(() => {
        setData(null);
        setError("");
        reload();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    async function saveNote() {
        setNoteBusy(true);
        setNoteError("");
        try {
            await addFollowup(id, note);
            setNote("");
            await reload();
        } catch (err) {
            setNoteError(err.response?.data?.message || "Unable to save the note.");
        } finally {
            setNoteBusy(false);
        }
    }

    if (error) {
        return (
            <Box sx={{ maxWidth: 900 }}>
                <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 1 }}>Back</Button>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!data) {
        return (
            <Box sx={{ maxWidth: 1100 }}>
                <Skeleton variant="rounded" height={70} sx={{ mb: 2 }} />
                <Skeleton variant="rounded" height={260} />
            </Box>
        );
    }

    const { student, parent, attendance, marks, homework, warning } = data;
    const a = attendance.last30;
    const fullName = `${student.first_name} ${student.last_name || ""}`.trim();
    const low = a.percent !== null && a.percent < attendance.warn_limit;
    const latest = marks.length ? marks[marks.length - 1] : null;

    return (
        <Box sx={{ maxWidth: 1100 }}>

            <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ mb: 1 }}>Back</Button>

            <PageHeader
                eyebrow={`Admission no. ${student.admission_no}`}
                title={fullName}
                subtitle={`${student.class_name} - ${student.section_name}${student.class_teacher ? ` · Class teacher ${student.class_teacher}` : ""}${student.is_active ? "" : " · Inactive"}`}
                avatar={`${(student.first_name || "?")[0]}${(student.last_name || "")[0] || ""}`.toUpperCase()}
                avatarSize={52}
            />

            {attendance.on_leave_now && (
                <Alert severity="info" sx={{ mb: 2 }}>
                    On approved leave{attendance.on_leave_now.from_date === attendance.on_leave_now.to_date ? " today" : `: ${attendance.on_leave_now.from_date} to ${attendance.on_leave_now.to_date}`}.
                </Alert>
            )}

            {warning && warning.flags.length > 0 && (
                <Alert severity={warning.severity === "high" ? "error" : "warning"} sx={{ mb: 2 }}>
                    <b>{warning.severity === "high" ? "Needs attention: " : "Keep an eye: "}</b>
                    {warning.flags.map((f) => f.text).join(" · ")}
                </Alert>
            )}

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2, alignItems: "start" }}>

                <Section title="Attendance" note="Last 30 days" sx={{ gridColumn: { md: "1 / -1" } }}>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", sm: "repeat(5, 1fr)" }, gap: 2, mb: 2.5 }}>
                        <Stat label="Attendance" value={a.percent === null ? "-" : `${a.percent}%`} tone={a.percent === null ? undefined : low ? "#B91C1C" : "#15803D"} />
                        <Stat label="Present days" value={a.present} />
                        <Stat label="Late" value={a.late} tone={a.late ? "#B45309" : undefined} />
                        <Stat label="Absent" value={a.absent + (a.half ? 0 : 0)} tone={a.absent ? "#B91C1C" : undefined} />
                        <Stat label="Absent now" value={attendance.streak ? `${attendance.streak} ${attendance.streak === 1 ? "day" : "days"} running` : "No"} tone={attendance.streak ? "#B91C1C" : undefined} />
                    </Box>

                    {attendance.leave_absences > 0 && (
                        <Typography sx={{ color: "text.secondary", fontSize: "0.84rem", mt: -1.5, mb: 2 }}>
                            {attendance.leave_absences} of the {a.absent} absent {a.absent === 1 ? "day was" : "days were"} on approved leave.
                        </Typography>
                    )}

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "auto 1fr" }, gap: { xs: 2.5, md: 5 } }}>
                        <AttendanceCalendar days={attendance.days} asOf={data.as_of} />
                        <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: "0.86rem", mb: 1 }}>By month</Typography>
                            {attendance.months.length === 0 && <Typography sx={{ color: "text.secondary", fontSize: "0.86rem" }}>No attendance recorded yet.</Typography>}
                            <Table size="small">
                                <TableBody>
                                    {[...attendance.months].reverse().map((m) => (
                                        <TableRow key={m.month}>
                                            <TableCell sx={{ fontWeight: 600 }}>{monthLabel(m.month)}</TableCell>
                                            <TableCell align="right">{m.percent === null ? "-" : `${m.percent}%`}</TableCell>
                                            <TableCell align="right" sx={{ color: "text.secondary" }}>{m.absent} absent · {m.late} late</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Box>
                    </Box>
                </Section>

                <Section title="Marks" note={marks.length ? "Percentage in each exam" : undefined}>
                    {marks.length === 0 && <Typography sx={{ color: "text.secondary", fontSize: "0.88rem" }}>No marks entered yet.</Typography>}
                    {marks.length > 0 && (
                        <>
                            <MarksChart marks={marks} />
                            {latest && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography sx={{ fontWeight: 700, fontSize: "0.86rem", mb: 0.5 }}>{latest.exam_name}: by subject</Typography>
                                    <Box sx={{ overflowX: "auto" }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Subject</TableCell>
                                                    <TableCell align="right">Marks</TableCell>
                                                    <TableCell align="right">Result</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {latest.subjects.map((s) => (
                                                    <TableRow key={s.subject}>
                                                        <TableCell>{s.subject}</TableCell>
                                                        <TableCell align="right">{s.got} / {s.max}</TableCell>
                                                        <TableCell align="right" sx={{ fontWeight: 700, color: s.failed ? "#B91C1C" : "#15803D" }}>{s.failed ? "Below pass" : "Pass"}</TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                </Box>
                            )}
                        </>
                    )}
                </Section>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>

                    <Section title="Homework" note="Last 30 days, posts that need an acknowledgement">
                        <Row label="Acknowledged">{homework.given ? `${homework.acknowledged} of ${homework.given}` : "No posts yet"}</Row>
                    </Section>

                    <Section title="Follow-up notes" note="What was done for this student">
                        {(data.followups || []).length === 0 && <Typography sx={{ color: "text.secondary", fontSize: "0.88rem", mb: 1 }}>No notes yet.</Typography>}
                        {(data.followups || []).map((f) => (
                            <Box key={f.id} data-testid="profile-followup" sx={{ py: 0.9, borderBottom: "1px solid var(--sl-border)" }}>
                                <Typography sx={{ fontSize: "0.9rem", overflowWrap: "anywhere" }}>{f.note}</Typography>
                                <Typography sx={{ fontSize: "0.74rem", color: "text.secondary" }}>
                                    {new Date(f.created_at).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })}{f.by_name ? ` · ${f.by_name}` : ""}
                                </Typography>
                            </Box>
                        ))}
                        <TextField fullWidth multiline minRows={2} size="small" label="Add a note" value={note}
                            onChange={(e) => setNote(e.target.value)} inputProps={{ maxLength: 500 }} sx={{ mt: 1.5 }} />
                        {noteError && <Typography sx={{ color: "error.main", fontSize: "0.78rem", mt: 0.5 }}>{noteError}</Typography>}
                        <Button variant="contained" size="small" onClick={saveNote} disabled={noteBusy || note.trim().length < 3} sx={{ mt: 1 }}>
                            {noteBusy ? "Saving..." : "Save note"}
                        </Button>
                    </Section>

                    <Section title="Parent and contact">
                        <Row label="Father">{parent.father_name}</Row>
                        <Row label="Mother">{parent.mother_name}</Row>
                        <Row label="Phone">{parent.phone ? <a href={`tel:${parent.phone}`} style={{ color: "inherit" }}>{parent.phone}</a> : null}</Row>
                        <Row label="Email">{parent.email}</Row>
                        <Row label="SchoolLink app">{parent.app_accounts > 0 ? "Parent account linked" : "No parent account linked yet"}</Row>
                    </Section>

                </Box>

            </Box>
        </Box>
    );
}

export default StudentProfilePage;
