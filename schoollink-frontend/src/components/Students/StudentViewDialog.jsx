import {
    Avatar,
    Box,
    Chip,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    Typography
} from "@mui/material";

import CloseIcon from "@mui/icons-material/CloseOutlined";

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

function StudentViewDialog({ open, student, onClose }) {

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

                    <Grid item xs={6}>

                        <Field label="Admission No" value={student.admission_no} />

                    </Grid>

                    <Grid item xs={6}>

                        <Field
                            label="Class"
                            value={student.class_name
                                ? `${student.class_name}${student.section_name ? ` - ${student.section_name}` : ""}`
                                : null}
                        />

                    </Grid>

                    <Grid item xs={6}>

                        <Field label="Gender" value={student.gender} />

                    </Grid>

                    <Grid item xs={6}>

                        <Field
                            label="Date of Birth"
                            value={student.date_of_birth ? student.date_of_birth.slice(0, 10) : null}
                        />

                    </Grid>

                    <Grid item xs={6}>

                        <Field label="Father's Name" value={student.father_name} />

                    </Grid>

                    <Grid item xs={6}>

                        <Field label="Mother's Name" value={student.mother_name} />

                    </Grid>

                    <Grid item xs={6}>

                        <Field label="Parent Phone" value={student.parent_phone} />

                    </Grid>

                    <Grid item xs={6}>

                        <Field label="Parent Email" value={student.parent_email} />

                    </Grid>

                    <Grid item xs={12}>

                        <Field label="Address" value={student.address} />

                    </Grid>

                </Grid>

            </DialogContent>

        </Dialog>

    );

}

export default StudentViewDialog;
