import {

    AppBar,

    Toolbar,

    Typography,

    Box,

    Avatar,

    IconButton

} from "@mui/material";

import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

function Topbar(){

    return(

        <AppBar

            position="static"

            elevation={0}

            color="inherit"

            sx={{

                borderBottom:"1px solid #E5E7EB"

            }}

        >

            <Toolbar>

                <Typography

                    variant="h6"

                    sx={{

                        fontWeight:700,

                        color:"#0F172A"

                    }}

                >

                    Dashboard

                </Typography>

                <Box sx={{flexGrow:1}}/>

                <IconButton>

                    <NotificationsNoneIcon/>

                </IconButton>

                <Avatar sx={{ml:2}}>

                    A

                </Avatar>

            </Toolbar>

        </AppBar>

    );

}

export default Topbar;