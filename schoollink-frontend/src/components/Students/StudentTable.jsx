import { useState } from "react";

import { Avatar, Box, Button, Card, Chip, IconButton, Menu, MenuItem, Typography } from "@mui/material";

import EditIcon from "@mui/icons-material/EditOutlined";
import VisibilityIcon from "@mui/icons-material/VisibilityOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVertRounded";
import PhoneIcon from "@mui/icons-material/PhoneOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlineRounded";

const PAGE = 24;

function ageOf(dob) {
    if (!dob) return null;
    const d = new Date(String(dob).slice(0, 10) + "T00:00:00Z");
    if (Number.isNaN(d.getTime())) return null;
    const now = new Date();
    let a = now.getUTCFullYear() - d.getUTCFullYear();
    const m = now.getUTCMonth() - d.getUTCMonth();
    if (m < 0 || (m === 0 && now.getUTCDate() < d.getUTCDate())) a--;
    return a >= 0 && a < 30 ? a : null;
}

/**
 * Student cards (replaces the old table). Shows class, age, parent and
 * phone at a glance; the first 24 are drawn, "Show more" adds the rest.
 */
export default function StudentTable({ students, onView, onEdit, onDelete }) {

    const [shown, setShown] = useState(PAGE);
    const [menu, setMenu] = useState(null);

    const list = students.slice(0, shown);

    return (
        <>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }, gap: 1.5 }}>

                {list.map((student) => {

                    const age = ageOf(student.date_of_birth);
                    const parent = student.father_name || student.mother_name;
                    const girl = student.gender === "Female";

                    return (
                        <Card
                            key={student.id}
                            data-testid="student-card"
                            sx={{
                                p: 1.75,
                                borderRadius: 3,
                                border: "1px solid var(--sl-border, #EEF2F7)",
                                boxShadow: "var(--sl-card-shadow, 0 1px 3px rgba(15,23,42,.06))",
                                opacity: student.is_active ? 1 : 0.72,
                                display: "flex",
                                flexDirection: "column",
                                gap: 1
                            }}
                        >

                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <Avatar
                                    sx={{
                                        width: 44, height: 44, fontWeight: 800,
                                        bgcolor: "var(--sl-banner, #FFC400)",
                                        color: "var(--sl-on-banner, #111827)"
                                    }}
                                >
                                    {(student.first_name || "?")[0]}{(student.last_name || "")[0] || ""}
                                </Avatar>

                                <Box sx={{ minWidth: 0, flex: 1 }}>
                                    <Typography sx={{ fontWeight: 700, lineHeight: 1.25 }} noWrap>
                                        {student.first_name} {student.last_name}
                                    </Typography>
                                    <Typography sx={{ color: "text.secondary", fontSize: "0.8rem" }} noWrap>
                                        Adm. {student.admission_no}
                                        {student.gender ? ` - ${student.gender}` : ""}
                                        {age !== null ? ` - ${age} yrs` : ""}
                                    </Typography>
                                </Box>

                                {!student.is_active && (
                                    <Chip size="small" label="Inactive" sx={{ fontWeight: 700, bgcolor: "#F1F5F9", color: "#64748B" }} />
                                )}
                            </Box>

                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.6 }}>
                                {student.class_name && (
                                    <Chip
                                        size="small"
                                        label={`${student.class_name}${student.section_name ? ` - ${student.section_name}` : ""}`}
                                        sx={{ fontWeight: 700, bgcolor: "var(--sl-soft, var(--sl-soft))", color: "var(--sl-ink, var(--sl-primary-dark))" }}
                                    />
                                )}
                                {student.blood_group && (
                                    <Chip size="small" label={student.blood_group} sx={{ bgcolor: "#FEE2E2", color: "#991B1B", fontWeight: 600 }} />
                                )}
                            </Box>

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.3, color: "text.secondary" }}>
                                {parent && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                        <PersonIcon sx={{ fontSize: 16 }} />
                                        <Typography sx={{ fontSize: "0.84rem" }} noWrap>{parent}</Typography>
                                    </Box>
                                )}
                                {student.parent_phone && (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                        <PhoneIcon sx={{ fontSize: 16 }} />
                                        <Typography
                                            component="a"
                                            href={`tel:${student.parent_phone}`}
                                            sx={{ fontSize: "0.84rem", color: "inherit", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
                                        >
                                            {student.parent_phone}
                                        </Typography>
                                    </Box>
                                )}
                                {!parent && !student.parent_phone && (
                                    <Typography sx={{ fontSize: "0.82rem", color: "#B45309" }}>No parent contact added</Typography>
                                )}
                            </Box>

                            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 0.5, mt: "auto" }}>
                                <Button size="small" startIcon={<VisibilityIcon fontSize="small" />} onClick={() => onView(student)}>View</Button>
                                <Button size="small" startIcon={<EditIcon fontSize="small" />} onClick={() => onEdit(student)}>Edit</Button>
                                <IconButton size="small" aria-label="More actions" onClick={(e) => setMenu({ anchor: e.currentTarget, student })}>
                                    <MoreVertIcon fontSize="small" />
                                </IconButton>
                            </Box>

                        </Card>
                    );
                })}

            </Box>

            {students.length > shown && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                    <Button variant="outlined" onClick={() => setShown(shown + PAGE)}>
                        Show more ({students.length - shown} left)
                    </Button>
                </Box>
            )}

            <Menu anchorEl={menu ? menu.anchor : null} open={!!menu} onClose={() => setMenu(null)}>
                {menu && menu.student.is_active && (
                    <MenuItem sx={{ color: "error.main" }} onClick={() => { const s = menu.student; setMenu(null); onDelete(s); }}>Deactivate</MenuItem>
                )}
                {menu && !menu.student.is_active && (
                    <MenuItem sx={{ color: "success.main" }} onClick={() => { const s = menu.student; setMenu(null); onDelete(s); }}>Reactivate</MenuItem>
                )}
            </Menu>
        </>
    );
}
