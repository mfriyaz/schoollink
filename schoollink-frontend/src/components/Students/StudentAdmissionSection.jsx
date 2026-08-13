import {
    Paper,
    Typography,
    Grid,
    TextField
} from "@mui/material";

function StudentAdmissionSection({ formData, handleChange }) {

    return (

        <Paper
            elevation={0}
            sx={{
                p: 4,
                borderRadius: 4,
                border: "1px solid #E5E7EB",
                mb: 4
            }}
        >

            <Typography
                variant="h6"
                fontWeight={700}
                mb={3}
            >

                Admission Information

            </Typography>

            <Grid container spacing={3}>

                <Grid size={{ xs: 12, md: 4 }}>

                    <TextField
                        fullWidth
                        label="Admission Number"
                        name="admission_no"
                        value={formData.admission_no}
                        onChange={handleChange}
                    />

                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>

                    <TextField
                        fullWidth
                        label="Admission Date"
                        type="date"
                        name="admission_date"
                        value={formData.admission_date}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true
                        }}
                    />

                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>

                    <TextField
                        fullWidth
                        label="Academic Year"
                        name="academic_year"
                        value={formData.academic_year}
                        onChange={handleChange}
                    />

                </Grid>

            </Grid>

        </Paper>

    );

}

export default StudentAdmissionSection;