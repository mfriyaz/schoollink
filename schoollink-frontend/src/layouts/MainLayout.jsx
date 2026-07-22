import { Outlet } from "react-router-dom";

import {

    Box,
    Toolbar

} from "@mui/material";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const drawerWidth = 250;

function MainLayout() {

    return (

        <Box sx={{ display: "flex" }}>

            {/* Left Sidebar */}

            <Sidebar />

            {/* Top Header */}

            <Topbar />

            {/* Page Content */}

            <Box

                component="main"

                sx={{

                    flexGrow: 1,

                    bgcolor: "#F8FAFC",

                    minHeight: "100vh",

                    ml: `${drawerWidth}px`,

                    p: 3

                }}

            >

                {/* Leave space for Topbar */}

                <Toolbar />

                {/* Current Page */}

                <Outlet />

            </Box>

        </Box>

    );

}

export default MainLayout;