import { useEffect, useState } from "react";

import { Box, useMediaQuery, useTheme } from "@mui/material";

import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import BottomNav from "./BottomNav";

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
                background: "linear-gradient(180deg,#EEF0FF 0%,#F4F5FF 220px,#F7F8FF 100%)"
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
                        p: { xs: 2, sm: 3, md: 4 },
                        pb: { xs: "calc(96px + env(safe-area-inset-bottom))", md: 4 }
                    }}
                >

                    <Outlet />

                </Box>

            </Box>

            {isMobile && <BottomNav onMore={() => setMobileOpen(true)} />}

        </Box>

    );

}

export default MainLayout;
