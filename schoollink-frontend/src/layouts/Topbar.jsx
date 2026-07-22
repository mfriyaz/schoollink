import {

    AppBar,
    Toolbar,
    Typography,
    Box,
    IconButton,
    Avatar,
    Tooltip

} from "@mui/material";

import NotificationsIcon from "@mui/icons-material/Notifications";

function Topbar() {

    const user = JSON.parse(localStorage.getItem("user") || "{}");

    return (

        <AppBar

            position="fixed"

            color="inherit"

            elevation={1}

            sx={{

                width: "calc(100% - 250px)",

                ml: "250px",

                backgroundColor: "#ffffff"

            }}

        >

            <Toolbar>

                <Typography

                    variant="h6"

                    sx={{

                        flexGrow: 1,

                        color: "#1E293B",

                        fontWeight: 600

                    }}

                >

                    SchoolLink ERP

                </Typography>

                <Tooltip title="Notifications">

                    <IconButton>

                        <NotificationsIcon />

                    </IconButton>

                </Tooltip>

                <Box

                    sx={{

                        display: "flex",

                        alignItems: "center",

                        ml: 2

                    }}

                >

                    <Avatar sx={{ bgcolor: "#2563EB" }}>

                        {user.full_name
                            ? user.full_name.charAt(0).toUpperCase()
                            : "A"}

                    </Avatar>

                    <Box sx={{ ml: 1 }}>

                        <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                        >

                            {user.full_name || "Administrator"}

                        </Typography>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                        >

                            {user.role_name || "School Admin"}

                        </Typography>

                    </Box>

                </Box>

            </Toolbar>

        </AppBar>

    );

}

export default Topbar;