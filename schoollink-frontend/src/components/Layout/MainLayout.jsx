import { useState } from "react";

import { Box } from "@mui/material";

import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout() {

    const [collapsed, setCollapsed] = useState(false);

    return (

        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                bgcolor: "#F8FAFC"
            }}
        >

            <Sidebar collapsed={collapsed} />

            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0
                }}
            >

                <Topbar onToggleSidebar={() => setCollapsed((c) => !c)} />

                <Box
                    sx={{
                        flex: 1,
                        p: 4
                    }}
                >

                    <Outlet />

                </Box>

            </Box>

        </Box>

    );

}

export default MainLayout;
