import { useEffect, useState } from "react";

import { Box, useMediaQuery, useTheme } from "@mui/material";

import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

function MainLayout() {

    const [collapsed, setCollapsed] = useState(false);

    const [mobileOpen, setMobileOpen] = useState(false);

    const theme = useTheme();

    // MUI's default "md" breakpoint is 900px - below that, the
    // sidebar becomes an overlay drawer instead of a permanent
    // panel sharing the screen with content.
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    useEffect(() => {

        function handleKeyDown(event) {

            // Ctrl+< (or Cmd+< on Mac) toggles the sidebar.
            if ((event.ctrlKey || event.metaKey) && event.key === "<") {

                event.preventDefault();

                setCollapsed((c) => !c);

            }

        }

        window.addEventListener("keydown", handleKeyDown);

        return () => window.removeEventListener("keydown", handleKeyDown);

    }, []);

    function handleToggleSidebar() {

        if (isMobile) {

            setMobileOpen((v) => !v);

        } else {

            setCollapsed((c) => !c);

        }

    }

    return (

        <Box
            sx={{
                display: "flex",
                minHeight: "100vh",
                bgcolor: "#F8FAFC"
            }}
        >

            <Sidebar
                collapsed={!isMobile && collapsed}
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />

            <Box
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    minWidth: 0
                }}
            >

                <Topbar onToggleSidebar={handleToggleSidebar} />

                <Box
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        overflowX: "hidden",
                        p: { xs: 2, sm: 3, md: 4 }
                    }}
                >

                    <Outlet />

                </Box>

            </Box>

        </Box>

    );

}

export default MainLayout;
