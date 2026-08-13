import {
    Paper,
    Typography,
    Grid,
    TextField,
    MenuItem
} from "@mui/material";

function StudentPersonalSection({ formData, handleChange }) {

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
                Personal Information
            </Typography>

            <Grid container spacing={3}>

                <Grid size={{ xs: 12, md: 6 }}>

                    <TextField
                        fullWidth
                        label="First Name"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                    />

                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>

                    <TextField
                        fullWidth
                        label="Last Name"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                    />

                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>

                    <TextField
                        select
                        fullWidth
                        label="Gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleChange}
                    >
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                    </TextField>

                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>

                    <TextField
                        fullWidth
                        type="date"
                        label="Date of Birth"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        InputLabelProps={{
                            shrink: true
                        }}
                    />

                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>

                    <TextField
                        fullWidth
                        label="Blood Group"
                        name="blood_group"
                        value={formData.blood_group}
                        onChange={handleChange}
                    />

                </Grid>

            </Grid>

        </Paper>

    );

}

export default StudentPersonalSection;