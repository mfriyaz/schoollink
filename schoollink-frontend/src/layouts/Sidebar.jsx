import {

    Box,

    Typography,

    List,

    ListItemButton,

    ListItemText

} from "@mui/material";

import { Link, useLocation } from "react-router-dom";

const menus = [

    {

        title: "Dashboard",

        path: "/dashboard"

    },

    {

        title: "Students",

        path: "/students"

    }

];

function Sidebar() {

    const location = useLocation();

    return (

        <Box

            sx={{

                width: 250,

                bgcolor: "#0F172A",

                color: "white",

                minHeight: "100vh"

            }}

        >

            <Typography

                variant="h5"

                sx={{

                    p:3,

                    fontWeight:700

                }}

            >

                SchoolLink

            </Typography>

            <List>

                {

                    menus.map(menu=>(

                        <ListItemButton

                            key={menu.path}

                            component={Link}

                            to={menu.path}

                            selected={location.pathname===menu.path}

                            sx={{

                                color:"white",

                                "&.Mui-selected":{

                                    bgcolor:"#2563EB"

                                }

                            }}

                        >

                            <ListItemText primary={menu.title}/>

                        </ListItemButton>

                    ))

                }

            </List>

        </Box>

    );

}

export default Sidebar;