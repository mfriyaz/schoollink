import { Grid } from "@mui/material";

function DashboardSection({

    left,

    right

}) {

    return (

        <Grid
            container
            spacing={3}
            sx={{ mt: 2 }}
        >

            <Grid
                item
                xs={12}
                md={7}
            >

                {left}

            </Grid>

            <Grid
                item
                xs={12}
                md={5}
            >

                {right}

            </Grid>

        </Grid>

    );

}

export default DashboardSection;