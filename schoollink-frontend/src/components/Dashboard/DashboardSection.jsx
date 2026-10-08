import { Grid } from "@mui/material";

function DashboardSection({
    left,
    right
}) {
    return (
        <Grid
            container
            spacing={{ xs: 2, md: 3 }}
            sx={{ mt: 2 }}
        >
            <Grid size={{ xs: 12, md: 7 }}>
                {left}
            </Grid>

            <Grid size={{ xs: 12, md: 5 }}>
                {right}
            </Grid>
        </Grid>
    );
}

export default DashboardSection;
