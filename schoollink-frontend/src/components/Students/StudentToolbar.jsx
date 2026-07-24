import {
    Box,
    Typography,
    Button,
    TextField,
    InputAdornment
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import PersonAddIcon from "@mui/icons-material/PersonAdd";

export default function StudentToolbar({

    search,

    setSearch,

    onAdd

}) {

    return (

        <Box

            sx={{

                display: "flex",

                justifyContent: "space-between",

                alignItems: "center",

                mb: 3,

                flexWrap: "wrap",

                gap: 2

            }}

        >

            <Typography

                variant="h4"

                fontWeight={700}

            >

                Students

            </Typography>

            <Box

                sx={{

                    display: "flex",

                    gap: 2,

                    flexWrap: "wrap"

                }}

            >

                <TextField

                    size="small"

                    placeholder="Search student..."

                    value={search}

                    onChange={(e) =>

                        setSearch(e.target.value)

                    }

                    InputProps={{

                        startAdornment: (

                            <InputAdornment position="start">

                                <SearchIcon />

                            </InputAdornment>

                        )

                    }}

                    sx={{

                        width: 280

                    }}

                />

                <Button

                    variant="contained"

                    startIcon={<PersonAddIcon />}

                    onClick={onAdd}

                    sx={{

                        borderRadius: 3,

                        px: 3

                    }}

                >

                    Add Student

                </Button>

            </Box>

        </Box>

    );

}