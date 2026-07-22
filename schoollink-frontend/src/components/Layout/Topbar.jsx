import {

    AppBar,

    Toolbar,

    Typography,

    Avatar,

    Box

} from "@mui/material";

function Topbar() {

    const user = JSON.parse(

        localStorage.getItem("user")

    );

    return (

        <AppBar
            position="fixed"
            sx={{
                zIndex: 1201
            }}
        >

            <Toolbar>

                <Typography
                    variant="h6"
                    sx={{
                        flexGrow: 1
                    }}
                >

                    SchoolLink ERP

                </Typography>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2
                    }}
                >

                    <Typography>

                        {user?.full_name}

                    </Typography>

                    <Avatar>

                        {user?.full_name?.charAt(0)}

                    </Avatar>

                </Box>

            </Toolbar>

        </AppBar>

    );

}

export default Topbar;