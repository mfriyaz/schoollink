import { useEffect, useState } from "react";

import {
    Alert,
    Avatar,
    Box,
    Button,
    Chip,
    CircularProgress,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    MenuItem,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from "@mui/material";

import CloseIcon from "@mui/icons-material/CloseOutlined";
import PersonAddIcon from "@mui/icons-material/PersonAddOutlined";
import FamilyRestroomIcon from "@mui/icons-material/FamilyRestroomOutlined";

import {
    createOrLinkParent,
    getParentsForStudent
} from "../../services/parentService";

function Field({ label, value }) {

    return (

        <Box>

            <Typography sx={{ color: "#64748B", fontSize: "0.78rem" }}>

                {label}

            </Typography>

            <Typography sx={{ fontWeight: 500 }}>

                {value || "-"}

            </Typography>

        </Box>

    );

}

const relationships = ["Father", "Mother", "Guardian", "Other"];

function StudentViewDialog({ open, student, onClose }) {

    const [parents, setParents] = useState([]);

    const [loadingParents, setLoadingParents] = useState(false);

    const [showLinkForm, setShowLinkForm] = useState(false);

    const [parentMode, setParentMode] = useState("existing");

    const [relationship, setRelationship] = useState("Father");

    const [existingEmail, setExistingEmail] = useState("");

    const [newFullName, setNewFullName] = useState("");

    const [newEmail, setNewEmail] = useState("");

    const [newMobile, setNewMobile] = useState("");

    const [newPassword, setNewPassword] = useState("");

    const [linking, setLinking] = useState(false);

    const [linkError, setLinkError] = useState("");

    const [linkSuccess, setLinkSuccess] = useState("");

    useEffect(() => {

        if (open && student) {

            loadParents();

            setShowLinkForm(false);

            setLinkError("");

            setLinkSuccess("");

        }

    }, [open, student]);

    async function loadParents() {

        try {

            setLoadingParents(true);

            const response = await getParentsForStudent(student.id);

            if (response.success) {

                setParents(response.data);

            }

        } catch (err) {

            console.error(err);

        } finally {

            setLoadingParents(false);

        }

    }

    async function handleLinkParent() {

        setLinkError("");

        setLinkSuccess("");

        try {

            setLinking(true);

            const payload = { student_id: student.id, relationship };

            if (parentMode === "existing") {

                if (!existingEmail) {

                    setLinkError("Enter the existing parent's email.");

                    return;

                }

                payload.existing_parent_email = existingEmail;

            } else {

                if (!newFullName || !newEmail || !newPassword) {

                    setLinkError("Full name, email, and a temporary password are required.");

                    return;

                }

                payload.full_name = newFullName;

                payload.email = newEmail;

                payload.mobile = newMobile;

                payload.temporary_password = newPassword;

            }

            const response = await createOrLinkParent(payload);

            if (response.success) {

                setLinkSuccess(

                    response.data.is_new_account

                        ? "New parent account created and linked!"
                        : "Existing parent linked to this student!"

                );

                setExistingEmail("");

                setNewFullName("");

                setNewEmail("");

                setNewMobile("");

                setNewPassword("");

                setShowLinkForm(false);

                await loadParents();

            } else {

                setLinkError(response.message);

            }

        } catch (err) {

            setLinkError(

                err.response?.data?.message ||
                "Unable to link this parent."

            );

        } finally {

            setLinking(false);

        }

    }

    if (!student) {

        return null;

    }

    return (

        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>

            <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>

                Student Details

                <IconButton onClick={onClose} size="small">

                    <CloseIcon fontSize="small" />

                </IconButton>

            </DialogTitle>

            <DialogContent>

                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>

                    <Avatar sx={{ width: 56, height: 56, bgcolor: "#2563EB", fontSize: "1.3rem" }}>

                        {student.first_name ? student.first_name[0] : "?"}

                    </Avatar>

                    <Box>

                        <Typography variant="h6" sx={{ fontWeight: 700 }}>

                            {student.first_name} {student.last_name}

                        </Typography>

                        <Chip
                            size="small"
                            color={student.is_active ? "success" : "default"}
                            label={student.is_active ? "Active" : "Inactive"}
                        />

                    </Box>

                </Box>

                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2.5}>

                    <Grid size={{ xs: 6 }}>

                        <Field label="Admission No" value={student.admission_no} />

                    </Grid>

                    <Grid size={{ xs: 6 }}>

                        <Field
                            label="Class"
                            value={student.class_name
                                ? `${student.class_name}${student.section_name ? ` - ${student.section_name}` : ""}`
                                : null}
                        />

                    </Grid>

                    <Grid size={{ xs: 6 }}>

                        <Field label="Gender" value={student.gender} />

                    </Grid>

                    <Grid size={{ xs: 6 }}>

                        <Field
                            label="Date of Birth"
                            value={student.date_of_birth ? student.date_of_birth.slice(0, 10) : null}
                        />

                    </Grid>

                    <Grid size={{ xs: 6 }}>

                        <Field label="Father's Name" value={student.father_name} />

                    </Grid>

                    <Grid size={{ xs: 6 }}>

                        <Field label="Mother's Name" value={student.mother_name} />

                    </Grid>

                    <Grid size={{ xs: 6 }}>

                        <Field label="Parent Phone" value={student.parent_phone} />

                    </Grid>

                    <Grid size={{ xs: 6 }}>

                        <Field label="Parent Email" value={student.parent_email} />

                    </Grid>

                    <Grid size={{ xs: 12 }}>

                        <Field label="Address" value={student.address} />

                    </Grid>

                </Grid>

                <Divider sx={{ my: 2.5 }} />

                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>

                    <Typography sx={{ fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>

                        <FamilyRestroomIcon fontSize="small" /> Parent / Portal Login

                    </Typography>

                    {!showLinkForm && (

                        <Button
                            size="small"
                            startIcon={<PersonAddIcon />}
                            onClick={() => setShowLinkForm(true)}
                        >

                            Link Parent

                        </Button>

                    )}

                </Box>

                {loadingParents && (

                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>

                        <CircularProgress size={22} />

                    </Box>

                )}

                {!loadingParents && parents.length === 0 && !showLinkForm && (

                    <Typography sx={{ color: "#94A3B8", fontSize: "0.85rem" }}>

                        No parent account linked yet.

                    </Typography>

                )}

                {!loadingParents && parents.map((p) => (

                    <Box

                        key={p.parent_user_id}

                        sx={{

                            display: "flex",

                            justifyContent: "space-between",

                            alignItems: "center",

                            py: 1,

                            borderBottom: "1px solid #F1F5F9"

                        }}

                    >

                        <Box>

                            <Typography sx={{ fontWeight: 600, fontSize: "0.9rem" }}>

                                {p.full_name} {p.relationship ? `(${p.relationship})` : ""}

                            </Typography>

                            <Typography sx={{ color: "#94A3B8", fontSize: "0.78rem" }}>

                                {p.email}

                            </Typography>

                        </Box>

                    </Box>

                ))}

                {showLinkForm && (

                    <Box sx={{ mt: 2, p: 2, borderRadius: 2, bgcolor: "#F8FAFC" }}>

                        {linkError && <Alert severity="error" sx={{ mb: 2 }}>{linkError}</Alert>}

                        {linkSuccess && <Alert severity="success" sx={{ mb: 2 }}>{linkSuccess}</Alert>}

                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={parentMode}
                            onChange={(e, val) => val && setParentMode(val)}
                            sx={{ mb: 2 }}
                        >

                            <ToggleButton value="existing">Existing Parent</ToggleButton>

                            <ToggleButton value="new">New Parent</ToggleButton>

                        </ToggleButtonGroup>

                        <TextField
                            select
                            label="Relationship"
                            size="small"
                            fullWidth
                            value={relationship}
                            onChange={(e) => setRelationship(e.target.value)}
                            sx={{ mb: 2 }}
                        >

                            {relationships.map((r) => (

                                <MenuItem key={r} value={r}>{r}</MenuItem>

                            ))}

                        </TextField>

                        {parentMode === "existing" ? (

                            <TextField
                                label="Existing Parent's Email"
                                size="small"
                                fullWidth
                                value={existingEmail}
                                onChange={(e) => setExistingEmail(e.target.value)}
                                helperText="Use this if the parent already has an account for another child at this school."
                                sx={{ mb: 2 }}
                            />

                        ) : (

                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mb: 2 }}>

                                <TextField
                                    label="Full Name"
                                    size="small"
                                    fullWidth
                                    value={newFullName}
                                    onChange={(e) => setNewFullName(e.target.value)}
                                />

                                <TextField
                                    label="Email"
                                    size="small"
                                    fullWidth
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                />

                                <TextField
                                    label="Mobile"
                                    size="small"
                                    fullWidth
                                    value={newMobile}
                                    onChange={(e) => setNewMobile(e.target.value)}
                                />

                                <TextField
                                    label="Temporary Password"
                                    size="small"
                                    fullWidth
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />

                            </Box>

                        )}

                        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5 }}>

                            <Button size="small" onClick={() => setShowLinkForm(false)}>

                                Cancel

                            </Button>

                            <Button
                                size="small"
                                variant="contained"
                                onClick={handleLinkParent}
                                disabled={linking}
                            >

                                {linking ? "Linking..." : "Link Parent"}

                            </Button>

                        </Box>

                    </Box>

                )}

            </DialogContent>

        </Dialog>

    );

}

export default StudentViewDialog;
