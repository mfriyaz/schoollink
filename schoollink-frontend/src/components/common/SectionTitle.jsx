import { Typography } from "@mui/material";

function SectionTitle({

    children

}){

    return(

        <Typography

            variant="h5"

            fontWeight={700}

            sx={{

                mb:3,

                mt:2

            }}

        >

            {children}

        </Typography>

    );

}

export default SectionTitle;