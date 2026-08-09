import {
    Paper,
    Typography,
    Grid,
    TextField,
    MenuItem
} from "@mui/material";

function StudentAcademicSection({ formData, handleChange }) {

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
                Academic Information
            </Typography>

            <Grid container spacing={3}>

                <Grid item xs={12} md={3}>

                    <TextField
                        select
                        fullWidth
                        label="School"
                        name="school"
                        value={formData.school}
                        onChange={handleChange}
                    >
                        <MenuItem value="Fousiyya School">
                            Fousiyya School
                        </MenuItem>
                    </TextField>

                </Grid>

                <Grid item xs={12} md={3}>

                    <TextField
                        select
                        fullWidth
                        label="Class"
                        name="class_name"
                        value={formData.class_name}
                        onChange={handleChange}
                    >
                        <MenuItem value="1">Grade 1</MenuItem>
                        <MenuItem value="2">Grade 2</MenuItem>
                        <MenuItem value="3">Grade 3</MenuItem>
                        <MenuItem value="4">Grade 4</MenuItem>
                        <MenuItem value="5">Grade 5</MenuItem>
                    </TextField>

                </Grid>

                <Grid item xs={12} md={3}>

                    <TextField
                        select
                        fullWidth
                        label="Section"
                        name="section"
                        value={formData.section}
                        onChange={handleChange}
                    >
                        <MenuItem value="A">A</MenuItem>
                        <MenuItem value="B">B</MenuItem>
                    </TextField>

                </Grid>

                <Grid item xs={12} md={3}>

                    <TextField
                        fullWidth
                        label="Roll Number"
                        name="roll_number"
                        value={formData.roll_number}
                        onChange={handleChange}
                    />

                </Grid>

            </Grid>

        </Paper>

    );

}

export default StudentAcademicSection;