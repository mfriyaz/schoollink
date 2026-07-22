import {

    Box,

    Toolbar

} from "@mui/material";

import Sidebar from "./Sidebar";

import Topbar from "./Topbar";

function DashboardLayout({ children }) {

    return (

        <Box sx={{ display: "flex" }}>

            <Topbar />

            <Sidebar />

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3
                }}
            >

                <Toolbar />

                {children}

            </Box>

        </Box>

    );

}

export default DashboardLayout;