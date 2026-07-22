import { Drawer } from "@mui/material";

import {

    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Box

} from "@mui/material";

import { NavLink } from "react-router-dom";

import NavigationMenu from "./NavigationMenu";

const drawerWidth = 250;

function Sidebar() {

    return (

        <Drawer

            variant="permanent"

            sx={{

                width: drawerWidth,

                flexShrink: 0,

                "& .MuiDrawer-paper": {

                    width: drawerWidth,

                    boxSizing: "border-box",

                    backgroundColor: "#1E293B",

                    color: "#fff"

                }

            }}

        >

            <Toolbar>

                <Typography

                    variant="h6"

                    fontWeight="bold"

                >

                    SchoolLink ERP

                </Typography>

            </Toolbar>

            <Box sx={{ overflow: "auto" }}>

                <List>

                    {

                        NavigationMenu.map((item) => (

                            <ListItem

                                key={item.title}

                                disablePadding

                            >

                                <ListItemButton

                                    component={NavLink}

                                    to={item.path}

                                    sx={{

                                        color: "#fff",

                                        "&.active": {

                                            backgroundColor: "#2563EB"

                                        },

                                        "&:hover": {

                                            backgroundColor: "#334155"

                                        }

                                    }}

                                >

                                    <ListItemIcon

                                        sx={{

                                            color: "#fff"

                                        }}

                                    >

                                        {item.icon}

                                    </ListItemIcon>

                                    <ListItemText

                                        primary={item.title}

                                    />

                                </ListItemButton>

                            </ListItem>

                        ))

                    }

                </List>

            </Box>

        </Drawer>

    );

}

export default Sidebar;