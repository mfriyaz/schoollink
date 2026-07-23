import { Card } from "@mui/material";

function AppCard({

    children,

    sx={}

}){

    return(

        <Card

            sx={{

                borderRadius:4,

                boxShadow:"0 10px 35px rgba(0,0,0,.05)",

                p:3,

                ...sx

            }}

        >

            {children}

        </Card>

    );

}

export default AppCard;